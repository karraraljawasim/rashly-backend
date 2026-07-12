import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { UserBookingController } from './user-booking.controller';

@Module({
  providers: [BookingService, BookingRepository],
  controllers: [BookingController, UserBookingController],
})
export class BookingModule {}
