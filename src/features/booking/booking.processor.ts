import { Logger } from '@nestjs/common';
import { WorkerHost, Processor } from '@nestjs/bullmq';
import { BookingRepository } from './booking.repository';
import { InventoryRedisService } from '../inventory/inventory-redis.service';
import { Job } from 'bullmq';
import { BookingStatus } from './enums/booking-status.enum';

@Processor('booking_expiry')
export class BookingProcessor extends WorkerHost {
  private readonly logger = new Logger('BookingProcessor');

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly inventoryRedisService: InventoryRedisService,
  ) {
    super();
  }

  async process(job: Job<{ bookingId: string }>) {
    if (job.name !== 'expiry_hold') return;

    const { bookingId } = job.data;
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      this.logger.warn(
        `Booking with id ${bookingId} not found during expiry check`,
      );
      return;
    }

    if (booking.status !== BookingStatus.Pending) {
      return;
    }

    await this.bookingRepository.updateStatus(
      booking.id,
      BookingStatus.Expired,
    );

    await this.inventoryRedisService.release(
      booking.inventoryItemId,
      booking.quantity,
    );

    this.logger.log(`Booking ${bookingId} expired, stock released`);
  }
}
