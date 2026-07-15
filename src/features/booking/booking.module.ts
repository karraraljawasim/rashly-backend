import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { UserBookingController } from './user-booking.controller';
import { InventoryRedisService } from '../inventory/inventory-redis.service';
import { InventoryModule } from '../inventory/inventory.module';
import { BullModule } from '@nestjs/bullmq';
import { BookingProcessor } from './booking.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'booking_expiry',
    }),
    InventoryModule,
  ],
  providers: [
    BookingService,
    BookingRepository,
    InventoryRedisService,
    BookingProcessor,
  ],
  controllers: [BookingController, UserBookingController],
})
export class BookingModule {}
