import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingRepository } from './booking.repository';
import { Role } from '../user/enums/user-role.enum';

@Injectable()
export class BookingService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async create(dto: CreateBookingDto, userId: string) {
    return await this.bookingRepository.create({
      ...dto,
      userId,
    });
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
