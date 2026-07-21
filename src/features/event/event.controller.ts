import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Delete,
  Patch,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { RoleGuard } from '../../shared/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../user/enums/user-role.enum';
import { UpdateEventDto } from './dto/update-event.dto';
import { OffsetPaginationParamsDto } from '../../shared/dto/offset-pagination-params.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('event')
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create event.' })
  @ApiResponse({
    status: 201,
    description: 'Create event successfully.',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          name: 'Test Event',
          description: '8kdkhe8-5717562-b3fc2c963f66afs8',
          saleStartsAt: new Date().toISOString(),
          saleEndsAt: new Date().toISOString(),
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
    status: 403,
    description: 'Forbidden: You do not have the right permissions.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events.' })
  @ApiResponse({
    status: 200,
    description:
      'Return array of events (or empty array if not found any event) with meta successfully.',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'Test Event',
            saleStartsAt: new Date().toISOString(),
          },
          {
            id: '66afa6f64-5717-4562-b3fc-2c963ffa6f64',
            name: 'Test Event 2',
            saleStartsAt: new Date().toISOString(),
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
  async getAll(@Query() query: OffsetPaginationParamsDto) {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const { items, totalCountResult } = await this.eventService.getAll(
      skip,
      limit,
    );

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

  @Get(':eventId')
  @ApiOperation({ summary: 'Get event details.' })
  @ApiResponse({
    status: 200,
    description: 'Return event successfully.',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          name: 'Test Event',
          description: '8kdkhe8-5717562-b3fc2c963f66afs8',
          saleStartsAt: new Date().toISOString(),
          saleEndsAt: new Date().toISOString(),
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
    status: 404,
    description: 'Not Found: Event with this id is not found.',
  })
  async getById(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return await this.eventService.getById(eventId);
  }

  @Delete(':eventId')
  @ApiOperation({ summary: 'Delete event.' })
  @ApiResponse({
    status: 200,
    description: 'Delete event successfully.',
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
    status: 404,
    description: 'Not Found: Event with this id is not found.',
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
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async deleteById(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return await this.eventService.deleteById(eventId);
  }

  @Patch(':eventId')
  @ApiOperation({ summary: 'Update event.' })
  @ApiResponse({
    status: 200,
    description: 'Update event successfully.',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          name: 'Test Event',
          description: '8kdkhe8-5717562-b3fc2c963f66afs8',
          saleStartsAt: new Date().toISOString(),
          saleEndsAt: new Date().toISOString(),
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
    status: 404,
    description: 'Not Found: Event with this id is not found.',
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
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async updateById(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.eventService.updateById(eventId, updateEventDto);
  }
}
