import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { EventInventoryController } from './event-inventory.controller';
import { EventModule } from '../event/event.module';
import { InventoryRepository } from './inventory.repository';

@Module({
  imports: [EventModule],
  providers: [InventoryService, InventoryRepository],
  controllers: [InventoryController, EventInventoryController],
})
export class InventoryModule {}
