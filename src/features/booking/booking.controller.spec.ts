/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRows } from './schema/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Role } from '../user/enums/user-role.enum';
import { PublicUser } from '../user/types/public-user.types';
import { BookingStatus } from './enums/booking-status.enum';

describe('BookingController', () => {
  let bookingController: BookingController;
  let bookingService: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: {
            create: jest.fn(),
            getById: jest.fn(),
            cancelBooking: jest.fn(),
          },
        },
      ],
    }).compile();

    bookingController = module.get<BookingController>(BookingController);
    bookingService = module.get<BookingService>(BookingService);
  });

  describe('create', () => {
    it('should create booking and return it ', async () => {
      jest.spyOn(bookingService, 'create').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
        quantity: 3,
        inventoryItemId: 'inventory 1',
      } as BookingRows);

      const result = await bookingController.create(
        {
          quantity: 3,
          inventoryItemId: 'inventory 1',
        } as CreateBookingDto,
        'user 1',
      );
      expect(bookingService.create).toHaveBeenCalledWith(
        {
          quantity: 3,
          inventoryItemId: 'inventory 1',
        },
        'user 1',
      );

      expect(result).toEqual({
        id: 'booking 1',
        userId: 'user 1',
        quantity: 3,
        inventoryItemId: 'inventory 1',
      });
    });
  });

  describe('getById', () => {
    it('should return booking if exist', async () => {
      jest.spyOn(bookingService, 'getById').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
        quantity: 3,
        inventoryItemId: 'inventory 1',
      } as BookingRows);

      const result = await bookingController.getById('booking 1', {
        id: 'user 1',
        role: Role.User,
      } as PublicUser);
      expect(bookingService.getById).toHaveBeenCalledWith(
        'booking 1',
        'user 1',
        Role.User,
      );

      expect(result).toEqual({
        id: 'booking 1',
        userId: 'user 1',
        quantity: 3,
        inventoryItemId: 'inventory 1',
      });
    });
  });

  describe('cancelBooking', () => {
    it('should update booking status to canceled', async () => {
      jest.spyOn(bookingService, 'getById').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
        quantity: 3,
        inventoryItemId: 'inventory 1',
        status: BookingStatus.Pending,
      } as BookingRows);

      jest.spyOn(bookingService, 'cancelBooking').mockResolvedValue({
        id: 'booking 1',
        userId: 'user 1',
        quantity: 3,
        inventoryItemId: 'inventory 1',
        status: BookingStatus.Canceled,
      } as BookingRows);

      const result = await bookingController.cancelBooking('booking 1', {
        id: 'user 1',
        role: Role.User,
      } as PublicUser);
      expect(bookingService.cancelBooking).toHaveBeenCalledWith(
        'booking 1',
        'user 1',
        Role.User,
      );

      expect(result).toEqual({
        id: 'booking 1',
        userId: 'user 1',
        quantity: 3,
        inventoryItemId: 'inventory 1',
        status: BookingStatus.Canceled,
      });
    });
  });
});
