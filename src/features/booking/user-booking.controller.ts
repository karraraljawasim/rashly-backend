import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { OffsetPaginationParamsDto } from '../../shared/dto/offset-pagination-params.dto';

@Controller('users/me/bookings')
export class UserBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBookingsByUserId(
    @GetUser('id') userId: string,
    @Query() query: OffsetPaginationParamsDto,
  ) {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const { items, totalCountResult } =
      await this.bookingService.getBookingsByUserId(userId, skip, limit);

    return {
      data: items,
      meta: {
        total: totalCountResult,
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalCountResult / limit),
        hasNextPage: page * limit < totalCountResult,
        hasPreviousPage: page > 1,
      },
    };
  }
}
