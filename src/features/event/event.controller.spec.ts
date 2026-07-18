/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRows } from './schema/event.schema';

describe('EventController', () => {
  let eventController: EventController;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: {
            create: jest.fn(),
            updateById: jest.fn(),
            getById: jest.fn(),
            deleteById: jest.fn(),
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    eventController = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  describe('getAll', () => {
    it('Should return all events with meta', async () => {
      jest.spyOn(eventService, 'getAll').mockResolvedValue({
        items: [
          { id: 'event 1', name: 'test event' } as EventRows,
          { id: 'event 2', name: 'test event 2' } as EventRows,
        ],
        totalCountResult: 10,
      });

      const result = await eventController.getAll({ limit: 2, page: 1 });
      expect(eventService.getAll).toHaveBeenCalled();
      expect(result).toEqual({
        data: [
          { id: 'event 1', name: 'test event' },
          { id: 'event 2', name: 'test event 2' },
        ],
        meta: {
          total: 10,
          currentPage: 1,
          limit: 2,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('create', () => {
    it('Should create event and return', async () => {
      const createEventDto = {
        name: 'test event',
        saleStartsAt: new Date('2026-11-01'),
      };
      jest
        .spyOn(eventService, 'create')
        .mockResolvedValue({ id: 'event 1', name: 'test event' } as EventRows);

      const result = await eventController.create(createEventDto);
      expect(eventService.create).toHaveBeenCalledWith(createEventDto);
      expect(result).toEqual({
        id: 'event 1',
        name: 'test event',
      });
    });
  });

  describe('getById', () => {
    it('Should return event if exist', async () => {
      jest
        .spyOn(eventService, 'getById')
        .mockResolvedValue({ id: 'event 1', name: 'test event' } as EventRows);

      const result = await eventController.getById('event 1');
      expect(eventService.getById).toHaveBeenCalledWith('event 1');
      expect(result).toEqual({
        id: 'event 1',
        name: 'test event',
      });
    });
  });

  describe('deleteById', () => {
    it('Should delete event', async () => {
      await eventController.deleteById('event 1');
      expect(eventService.deleteById).toHaveBeenCalledWith('event 1');
    });
  });

  describe('updateById', () => {
    it('Should update event and return it', async () => {
      const updateEventDto = { name: 'new event name' };
      jest
        .spyOn(eventService, 'getById')
        .mockResolvedValue({ id: 'event 1', name: 'test event' } as EventRows);
      jest.spyOn(eventService, 'updateById').mockResolvedValue({
        id: 'event 1',
        name: 'new event name',
      } as EventRows);

      const result = await eventController.updateById(
        'event 1',
        updateEventDto,
      );
      expect(eventService.updateById).toHaveBeenCalledWith(
        'event 1',
        updateEventDto,
      );
      expect(result?.name).toEqual('new event name');
    });
  });
});
