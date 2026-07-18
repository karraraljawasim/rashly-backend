/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { EventInventoryController } from './event-inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRows } from './schema/inventory.schema';

describe('EventInventoryController', () => {
  let eventInventoryController: EventInventoryController;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventInventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            create: jest.fn(),
            getItemsByEventId: jest.fn(),
          },
        },
      ],
    }).compile();

    eventInventoryController = module.get<EventInventoryController>(
      EventInventoryController,
    );
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  describe('getItemsByEventId', () => {
    it('Should return an array of inventory items and metadata', async () => {
      jest.spyOn(inventoryService, 'getItemsByEventId').mockResolvedValue({
        items: [
          {
            id: 'inventory 1',
            name: 'test inventory',
            eventId: 'event 1',
          } as InventoryRows,
          {
            id: 'inventory 2',
            name: 'test inventory 2',
            eventId: 'event 1',
          } as InventoryRows,
        ],
        totalCountResult: 2,
      });

      const result = await eventInventoryController.getItemsByEventId(
        'event 1',
        { limit: 5, page: 1 },
      );
      expect(result).toEqual({
        data: [
          {
            id: 'inventory 1',
            name: 'test inventory',
            eventId: 'event 1',
          },
          {
            id: 'inventory 2',
            name: 'test inventory 2',
            eventId: 'event 1',
          },
        ],
        meta: {
          total: 2,
          currentPage: 1,
          limit: 5,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('create', () => {
    it('Should create and return inventory', async () => {
      jest.spyOn(inventoryService, 'create').mockResolvedValue({
        id: 'inventory 1',
        name: 'test inventory',
        eventId: 'event 1',
        price: '23',
        totalQuantity: 3,
      } as InventoryRows);

      const result = await eventInventoryController.create(
        { name: 'test inventory', price: '23', totalQuantity: 3 },
        'event 1',
      );
      expect(result).toEqual({
        id: 'inventory 1',
        name: 'test inventory',
        eventId: 'event 1',
        price: '23',
        totalQuantity: 3,
      });

      expect(inventoryService.create).toHaveBeenCalledWith(
        { name: 'test inventory', price: '23', totalQuantity: 3 },
        'event 1',
      );
    });
  });
});
