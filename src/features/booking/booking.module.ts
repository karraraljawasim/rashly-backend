import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { UserBookingController } from './user-booking.controller';
import { InventoryRedisService } from '../inventory/inventory-redis.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  providers: [BookingService, BookingRepository, InventoryRedisService],
  controllers: [BookingController, UserBookingController],
})
export class BookingModule {}
