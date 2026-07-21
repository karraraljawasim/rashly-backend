import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { OffsetPaginationParamsDto } from '../../shared/dto/offset-pagination-params.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingStatus } from './enums/booking-status.enum';

@ApiTags('user-booking')
@Controller('users/me/bookings')
export class UserBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @ApiOperation({ summary: 'Get bookings belong to the user.' })
  @ApiResponse({
    status: 200,
    description:
      'Return array of bookings (or empty array if not found any bookings) with meta successfully.',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            quantity: 1,
            status: BookingStatus.Pending,
            holdExpiresAt: new Date().toISOString(),
          },
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            quantity: 7,
            status: BookingStatus.Canceled,
            holdExpiresAt: new Date().toISOString(),
          },
        ],
        meta: {
          total: 4,
          currentPage: 1,
          limit: 2,
          totalPages: 4,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You do not have the right permissions.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  })
  @ApiBearerAuth()
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
