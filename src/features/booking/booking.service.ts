import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingRepository } from './booking.repository';
import { Role } from '../user/enums/user-role.enum';
import { InventoryRedisService } from '../inventory/inventory-redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingRows } from './schema/booking.schema';

const HOLD_DURATION_MS = 60 * 1000;

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly inventoryRedisService: InventoryRedisService,
    @InjectQueue('booking_expiry') private bookingQueue: Queue,
  ) {}

  async create(dto: CreateBookingDto, userId: string) {
    const reserveResult = await this.inventoryRedisService.reserve(
      dto.inventoryItemId,
      dto.quantity,
    );

    if (reserveResult === 'sold_out') {
      throw new ConflictException('Out of stock');
    }

    if (reserveResult === 'not_initialized') {
      throw new NotFoundException('Inventory not found or not initialized');
    }

    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);
    let booking: BookingRows;
    try {
      booking = await this.bookingRepository.create({
        ...dto,
        holdExpiresAt,
        userId,
      });
    } catch (error) {
      await this.inventoryRedisService.release(
        dto.inventoryItemId,
        dto.quantity,
      );
      throw error;
    }
    const delay = booking.holdExpiresAt.getTime() - Date.now();

    const job = await this.bookingQueue.add(
      'expiry_hold',
      { bookingId: booking.id },
      { delay: Math.max(0, delay) },
    );

    console.error('Job added:', job.id, 'delay:', delay);

    return booking;
  }

  async getById(bookingId: string, userId: string, userRole: Role) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking not found`);
    }
    if (booking.userId !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException();
    }

    return booking;
  }

  async getBookingsByUserId(userId: string, skip = 0, limit = 10) {
    return await this.bookingRepository.findBookingsByUserId(
      userId,
      skip,
      limit,
    );
  }

  async cancelBooking(bookingId: string, userId: string, userRole: Role) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking not found`);
    }
    if (booking.userId !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException();
    }

    return await this.bookingRepository.cancelBooking(bookingId);
  }
}
