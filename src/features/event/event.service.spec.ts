/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { EventRows } from './schema/event.schema';
import { NotFoundException } from '@nestjs/common';

describe('EventService', () => {
  let eventService: EventService;
  let eventRepository: EventRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: {
            create: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
            findById: jest.fn(),
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    eventService = module.get<EventService>(EventService);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  describe('getAll', () => {
    it('should return all events and event total count ', async () => {
      jest.spyOn(eventRepository, 'getAll').mockResolvedValue({
        items: [{ id: 'event 1' } as EventRows, { id: 'event 2' } as EventRows],
        totalCountResult: 2,
      });

      const result = await eventService.getAll();
      expect(result).toEqual({
        items: [{ id: 'event 1' } as EventRows, { id: 'event 2' } as EventRows],
        totalCountResult: 2,
      });

      expect(eventRepository.getAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create event and return it', async () => {
      jest
        .spyOn(eventRepository, 'create')
        .mockResolvedValue({ id: 'event 1' } as EventRows);

      const result = await eventService.create({
        name: 'test event',
        saleStartsAt: new Date('2026-11-11'),
      });
      expect(result).toEqual({
        id: 'event 1',
      });
      expect(eventRepository.create).toHaveBeenCalledWith({
        name: 'test event',
        saleStartsAt: new Date('2026-11-11'),
      });
    });
  });

  describe('getById', () => {
    it('should return event', async () => {
      jest
        .spyOn(eventRepository, 'findById')
        .mockResolvedValue({ id: 'event 1' } as EventRows);

      const result = await eventService.getById('event 1');

      expect(result).toEqual({
        id: 'event 1',
      });
      expect(eventRepository.findById).toHaveBeenCalledWith('event 1');
    });

    it('should throw NotFoundException if event not found', async () => {
      jest.spyOn(eventRepository, 'findById').mockResolvedValue(undefined);
      await expect(eventService.getById('not_found_event_id')).rejects.toThrow(
        NotFoundException,
      );
      expect(eventRepository.findById).toHaveBeenCalledWith(
        'not_found_event_id',
      );
    });
  });

  describe('deleteById', () => {
    it('should delete event if exist', async () => {
      jest
        .spyOn(eventRepository, 'findById')
        .mockResolvedValue({ id: 'event 1' } as EventRows);

      await eventService.deleteById('event 1');
      expect(eventRepository.deleteById).toHaveBeenCalledWith('event 1');
    });

    it('should throw NotFoundException if event not found', async () => {
      jest.spyOn(eventRepository, 'findById').mockResolvedValue(undefined);
      await expect(
        eventService.deleteById('not_found_event_id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateById', () => {
    it('should update event if exist', async () => {
      jest
        .spyOn(eventRepository, 'findById')
        .mockResolvedValue({ id: 'event 1' } as EventRows);

      jest
        .spyOn(eventRepository, 'updateById')
        .mockResolvedValue({ id: 'event 1', name: 'update name' } as EventRows);

      const result = await eventService.updateById('event 1', {
        name: 'updated name',
      });
      expect(eventRepository.updateById).toHaveBeenCalledWith('event 1', {
        name: 'updated name',
      });
      expect(result).toEqual({ id: 'event 1', name: 'update name' });
    });

    it('should throw NotFoundException if event not found', async () => {
      jest.spyOn(eventRepository, 'findById').mockResolvedValue(undefined);
      await expect(
        eventService.updateById('not_found_event_id', { name: 'update name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
