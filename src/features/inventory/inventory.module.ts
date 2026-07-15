import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { EventInventoryController } from './event-inventory.controller';
import { EventModule } from '../event/event.module';
import { InventoryRepository } from './inventory.repository';
import { InventoryRedisService } from './inventory-redis.service';

@Module({
  imports: [EventModule],
  providers: [InventoryService, InventoryRepository, InventoryRedisService],
  controllers: [InventoryController, EventInventoryController],
  exports: [InventoryService, InventoryRedisService],
})
export class InventoryModule {}
