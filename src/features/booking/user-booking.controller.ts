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
    @Query() paginationDto: OffsetPaginationParamsDto,
  ) {
    return await this.bookingService.getBookingsByUserId(userId, paginationDto);
  }
}
