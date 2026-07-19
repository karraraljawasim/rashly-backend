/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingRows } from './schema/booking.schema';
import { Role } from '../user/enums/user-role.enum';
import { InventoryRedisService } from '../inventory/inventory-redis.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { BookingStatus } from './enums/booking-status.enum';

describe('BookingService', () => {
  let bookingService: BookingService;
  let bookingRepository: BookingRepository;
  let inventoryRedisService: InventoryRedisService;
  let bookingQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: BookingRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            cancelBooking: jest.fn(),
            findBookingsByUserId: jest.fn(),
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
          provide: getQueueToken('booking_expiry'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    bookingRepository = module.get<BookingRepository>(BookingRepository);
    inventoryRedisService = module.get<InventoryRedisService>(
      InventoryRedisService,
    );
    bookingQueue = module.get<Queue>(getQueueToken('booking_expiry'));
  });

  describe('getById', () => {
    it('should return booking if exist', async () => {
      jest.spyOn(bookingRepository, 'findById').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
      } as BookingRows);

      const result = await bookingService.getById(
        'booking 1',
        'user 1',
        Role.User,
      );
      expect(bookingRepository.findById).toHaveBeenCalledWith('booking 1');
      expect(result).toEqual({
        id: 'booking 1',
        userId: 'user 1',
      });
    });

    it('should throw NotFoundException if booking not exist', async () => {
      jest.spyOn(bookingRepository, 'findById').mockResolvedValue(undefined);
      await expect(
        bookingService.getById('not_exist_id', 'user 1', Role.User),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if userId not equal userId in booking and role not admin ', async () => {
      jest.spyOn(bookingRepository, 'findById').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
      } as BookingRows);
      await expect(
        bookingService.getById('booking 1', 'user 2', Role.User),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelBooking', () => {
    it('should update booking status to canceled', async () => {
      jest.spyOn(bookingRepository, 'findById').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
        status: BookingStatus.Pending,
      } as BookingRows);

      jest.spyOn(bookingRepository, 'cancelBooking').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
        status: BookingStatus.Canceled,
      } as BookingRows);

      const result = await bookingService.cancelBooking(
        'booking 1',
        'user 1',
        Role.User,
      );
      expect(bookingRepository.cancelBooking).toHaveBeenCalledWith('booking 1');
      expect(result).toEqual({
        id: 'booking 1',
        userId: 'user 1',
        status: BookingStatus.Canceled,
      });
    });

    it('should throw NotFoundException if booking not exist', async () => {
      jest.spyOn(bookingRepository, 'findById').mockResolvedValue(undefined);
      await expect(
        bookingService.cancelBooking('not_exist_id', 'user 1', Role.User),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if userId not equal userId in booking and role not admin ', async () => {
      jest.spyOn(bookingRepository, 'findById').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
      } as BookingRows);
      await expect(
        bookingService.cancelBooking('booking 1', 'user 2', Role.User),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getBookingsByUserId', () => {
    it('should return all bookings to the user', async () => {
      jest.spyOn(bookingRepository, 'findBookingsByUserId').mockResolvedValue({
        items: [
          {
            id: 'booking 1',
            userId: 'user 1',
          } as BookingRows,
          {
            id: 'booking 2',
            userId: 'user 1',
          } as BookingRows,
        ],
        totalCountResult: 2,
      });

      const skip = 0;
      const limit = 10;
      const result = await bookingService.getBookingsByUserId(
        'user 1',
        skip,
        limit,
      );
      expect(bookingRepository.findBookingsByUserId).toHaveBeenCalledWith(
        'user 1',
        skip,
        limit,
      );
      expect(result).toEqual({
        items: [
          {
            id: 'booking 1',
            userId: 'user 1',
          } as BookingRows,
          {
            id: 'booking 2',
            userId: 'user 1',
          } as BookingRows,
        ],
        totalCountResult: 2,
      });
    });
  });
});
