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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingStatus } from './enums/booking-status.enum';

@ApiTags('booking')
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create Booking.' })
  @ApiResponse({
    status: 201,
    description: 'Create booking and return it successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          userId: '4ks85f64-5717-4562-b3fc-2c963f66afs8',
          quantity: 1,
          status: BookingStatus.Pending,
          idempotencyKey: '8kdkhe8-5717562-b3fc2c963f66afs8',
          holdExpiresAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @GetUser('id') userId: string,
  ) {
    return await this.bookingService.create(createBookingDto, userId);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get booking details by id.' })
  @ApiResponse({
    status: 200,
    description: 'Return booking successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          userId: '4ks85f64-5717-4562-b3fc-2c963f66afs8',
          quantity: 1,
          status: BookingStatus.Pending,
          idempotencyKey: '8kdkhe8-5717562-b3fc2c963f66afs8',
          holdExpiresAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid uuid format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You do not have the right permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: Booking with this id is not found.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('bookingId') bookingId: string,
    @GetUser() user: PublicUser,
  ) {
    return await this.bookingService.getById(bookingId, user.id, user.role);
  }

  @Patch(':bookingId')
  @ApiOperation({ summary: 'Cancel booking (set stats to "cancel").' })
  @ApiResponse({
    status: 200,
    description: 'Cancel booking (set status to "cancel") successfully',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid uuid format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You do not have the right permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: Booking with this id is not found.',
  })
  @ApiBearerAuth()
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
