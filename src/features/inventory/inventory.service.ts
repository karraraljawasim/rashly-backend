import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { EventService } from '../event/event.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventService: EventService,
  ) {}

  async create(dto: CreateInventoryDto, eventId: string) {
    const event = await this.eventService.getById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return await this.inventoryRepository.create({
      ...dto,
      eventId,
    });
  }

  async getItemsByEventId(eventId: string, skip = 0, limit = 10) {
    const event = await this.eventService.getById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return await this.inventoryRepository.getItemsByEventId(
      eventId,
      skip,
      limit,
    );
  }

  async getById(inventoryId: string) {
    const inventory = await this.inventoryRepository.findById(inventoryId);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return inventory;
  }

  async deleteById(inventoryId: string) {
    const inventory = await this.inventoryRepository.findById(inventoryId);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    await this.inventoryRepository.deleteById(inventoryId);
    return;
  }

  async updateById(inventoryId: string, data: UpdateInventoryDto) {
    const inventory = await this.inventoryRepository.findById(inventoryId);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const [updatedInventory] = await this.inventoryRepository.updateById(
      inventoryId,
      {
        ...data,
      },
    );

    return updatedInventory;
  }
}
