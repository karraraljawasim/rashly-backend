/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRows } from './schema/inventory.schema';

describe('InventoryController', () => {
  let inventoryController: InventoryController;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            getById: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
          },
        },
      ],
    }).compile();

    inventoryController = module.get<InventoryController>(InventoryController);
    inventoryService = module.get<InventoryService>(InventoryService);
  });
  describe('getById', () => {
    it('should return an inventory if exist', async () => {
      jest.spyOn(inventoryService, 'getById').mockResolvedValue({
        id: 'inventory 1',
        name: 'test inventory',
      } as InventoryRows);

      const result = await inventoryController.getById('inventory 1');
      expect(result).toEqual({
        id: 'inventory 1',
        name: 'test inventory',
      });

      expect(inventoryService.getById).toHaveBeenCalledWith('inventory 1');
    });
  });

  describe('updateById', () => {
    it('should update and return inventory ', async () => {
      jest.spyOn(inventoryService, 'getById').mockResolvedValue({
        id: 'inventory 1',
        name: 'test inventory',
      } as InventoryRows);

      jest.spyOn(inventoryService, 'updateById').mockResolvedValue({
        id: 'inventory 1',
        name: 'new name',
      } as InventoryRows);

      const result = await inventoryController.updateById(
        {
          name: 'new name',
        },
        'inventory 1',
      );

      expect(inventoryService.updateById).toHaveBeenCalledWith('inventory 1', {
        name: 'new name',
      });
      expect(result).toEqual({
        id: 'inventory 1',
        name: 'new name',
      });
    });
  });

  describe('deleteById', () => {
    it('should delete inventory if exist ', async () => {
      jest.spyOn(inventoryService, 'getById').mockResolvedValue({
        id: 'inventory 1',
        name: 'test inventory',
      } as InventoryRows);

      await inventoryController.deleteById('inventory 1');

      expect(inventoryService.deleteById).toHaveBeenCalledWith('inventory 1');
    });
  });
});
