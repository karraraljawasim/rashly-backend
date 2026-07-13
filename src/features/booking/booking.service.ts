import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingRepository } from './booking.repository';
import { Role } from '../user/enums/user-role.enum';
import { OffsetPaginationParamsDto } from '../../shared/dto/offset-pagination-params.dto';

@Injectable()
export class BookingService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async create(dto: CreateBookingDto, userId: string) {
    return await this.bookingRepository.create({
      ...dto,
      userId,
    });
  }

  async getById(bookingId: string, userId: string, userRole: Role) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking not found`);
    }
    if (booking.userId !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException();
    }

    return booking;
  }

  async getBookingsByUserId(
    userId: string,
    pagination: OffsetPaginationParamsDto,
  ) {
    const currentPage = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (currentPage - 1) * limit;

    const [count, data] = await this.bookingRepository.findBookingsByUserId(
      userId,
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

  async cancelBooking(bookingId: string, userId: string, userRole: Role) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking not found`);
    }
    if (booking.userId !== userId && userRole !== Role.Admin) {
      throw new ForbiddenException();
    }

    return await this.bookingRepository.cancelBooking(bookingId);
  }
}
