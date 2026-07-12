import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicUser } from '../user/types/public-user.types';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @GetUser('id') userId: string,
  ) {
    return await this.bookingService.create(createBookingDto, userId);
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('bookingId') bookingId: string,
    @GetUser() user: PublicUser,
  ) {
    return await this.bookingService.getById(bookingId, user.id, user.role);
  }

  @Patch(':bookingId')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @GetUser() user: PublicUser,
  ) {
    return await this.bookingService.cancelBooking(
      bookingId,
      user.id,
      user.role,
    );
  }
}
