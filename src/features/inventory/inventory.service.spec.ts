/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { InventoryRows } from './schema/inventory.schema';
import { InventoryRedisService } from './inventory-redis.service';
import { EventService } from '../event/event.service';
import { EventRows } from '../event/schema/event.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let inventoryRepository: InventoryRepository;
  let inventoryRdisService: InventoryRedisService;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryRepository,
          useValue: {
            create: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
            findById: jest.fn(),
            getItemsByEventId: jest.fn(),
            getActiveStockCounts: jest.fn(),
          },
        },
        {
          provide: InventoryRedisService,
          useValue: {
            release: jest.fn(),
            reserve: jest.fn(),
            syncInventoryToRedis: jest.fn(),
          },
        },
        {
          provide: EventService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    inventoryService = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<InventoryRepository>(InventoryRepository);
    inventoryRdisService = module.get<InventoryRedisService>(
      InventoryRedisService,
    );
    eventService = module.get<EventService>(EventService);
  });
  describe('getItemsByEventId', () => {
    it('should return inventory items belong this event', async () => {
      jest.spyOn(inventoryRepository, 'getItemsByEventId').mockResolvedValue({
        items: [
          { id: 'inventory 1', eventId: 'event 1' } as InventoryRows,
          { id: 'inventory 2', eventId: 'event 1' } as InventoryRows,
        ],
        totalCountResult: 2,
      });

      jest
        .spyOn(eventService, 'getById')
        .mockResolvedValue({ id: 'event 1' } as EventRows);
      const result = await inventoryService.getItemsByEventId('event 1');
      expect(inventoryRepository.getItemsByEventId).toHaveBeenCalledWith(
        'event 1',
        0,
        10,
      );
      expect(result).toEqual({
        items: [
          { id: 'inventory 1', eventId: 'event 1' } as InventoryRows,
          { id: 'inventory 2', eventId: 'event 1' } as InventoryRows,
        ],
        totalCountResult: 2,
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      jest
        .spyOn(eventService, 'getById')
        .mockRejectedValue(new NotFoundException());
      await expect(
        inventoryService.getItemsByEventId('not_exist_id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getById', () => {
    it('should return inventory', async () => {
      jest.spyOn(inventoryRepository, 'findById').mockResolvedValue({
        id: 'inventory 1',
        eventId: 'event 1',
      } as InventoryRows);

      const result = await inventoryService.getById('inventory 1');
      expect(inventoryRepository.findById).toHaveBeenCalledWith('inventory 1');
      expect(result).toEqual({
        id: 'inventory 1',
        eventId: 'event 1',
      });
    });

    it('should throw NotFoundException if inventory not found', async () => {
      jest.spyOn(inventoryRepository, 'findById').mockResolvedValue(undefined);
      await expect(inventoryService.getById('not_exist_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateById', () => {
    it('should update inventory and return it', async () => {
      jest.spyOn(inventoryRepository, 'findById').mockResolvedValue({
        id: 'inventory 1',
        name: 'inventory name',
      } as InventoryRows);

      jest.spyOn(inventoryRepository, 'updateById').mockResolvedValue({
        id: 'inventory 1',
        name: 'new name',
      } as InventoryRows);

      const result = await inventoryService.updateById('inventory 1', {
        name: 'new name',
      });
      expect(inventoryRepository.findById).toHaveBeenCalledWith('inventory 1');
      expect(inventoryRepository.updateById).toHaveBeenCalledWith(
        'inventory 1',
        { name: 'new name' },
      );
      expect(result).toEqual({
        id: 'inventory 1',
        name: 'new name',
      });
    });

    it('should throw NotFoundException if inventory not found', async () => {
      jest.spyOn(inventoryRepository, 'findById').mockResolvedValue(undefined);
      await expect(
        inventoryService.updateById('not_exist_id', { name: 'new name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('should delete inventory', async () => {
      jest.spyOn(inventoryRepository, 'findById').mockResolvedValue({
        id: 'inventory 1',
        name: 'inventory name',
      } as InventoryRows);

      await inventoryService.deleteById('inventory 1');
      expect(inventoryRepository.deleteById).toHaveBeenCalledWith(
        'inventory 1',
      );
    });

    it('should throw NotFoundException if inventory not found', async () => {
      jest.spyOn(inventoryRepository, 'findById').mockResolvedValue(undefined);
      await expect(inventoryService.deleteById('not_exist_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create inventory and return it', async () => {
      jest.spyOn(eventService, 'getById').mockResolvedValue({
        id: 'event 1',
      } as EventRows);
      jest.spyOn(inventoryRepository, 'create').mockResolvedValue({
        id: 'inventory 1',
        name: 'test inventory',
        eventId: 'event 1',
      } as InventoryRows);

      const result = await inventoryService.create(
        {
          name: 'test inventory',
        } as CreateInventoryDto,
        'event 1',
      );
      expect(inventoryRepository.create).toHaveBeenCalledWith({
        name: 'test inventory',
        eventId: 'event 1',
      });

      expect(result).toEqual({
        id: 'inventory 1',
        name: 'test inventory',
        eventId: 'event 1',
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      jest
        .spyOn(eventService, 'getById')
        .mockRejectedValue(new NotFoundException());
      await expect(
        inventoryService.create(
          { name: 'inventory test' } as CreateInventoryDto,
          'not_exist_id',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
