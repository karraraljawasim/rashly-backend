import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { EventService } from '../event/event.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { OffsetPaginationParamsDto } from '../../shared/dto/offset-pagination-params.dto';

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

  async getItemsByEventId(
    eventId: string,
    pagination: OffsetPaginationParamsDto,
  ) {
    const event = await this.eventService.getById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const currentPage = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (currentPage - 1) * limit;

    const [count, data] = await this.inventoryRepository.getItemsByEventId(
      eventId,
      skip,
      limit,
    );

    const totalItems = count[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage: limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
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
