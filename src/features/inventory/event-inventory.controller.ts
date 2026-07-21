import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RoleGuard } from '../../shared/guards/roles.guard';
import { Role } from '../user/enums/user-role.enum';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { OffsetPaginationParamsDto } from '../../shared/dto/offset-pagination-params.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('event-inventory')
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
@ApiResponse({
  status: 401,
  description: 'Not Found: Event with this id is not found.',
})
@Controller('events/:eventId/inventory')
export class EventInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create inventory on event.' })
  @ApiResponse({
    status: 201,
    description: 'Create inventory and return it successfully.',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          eventId: '45625f64-5717-63f6-b3fc-2c963f66afa6',
          name: 'Test Inventory',
          price: '89.00',
          totalQuantity: 5,
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
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return await this.inventoryService.create(createInventoryDto, eventId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items belong to event.' })
  @ApiResponse({
    status: 200,
    description:
      'Return array of inventory items (or empty array if not found any inventory) with meta successfully.',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'Test Inventory',
            price: '919.30',
            totalQuantity: 9,
          },
          {
            id: '66afa6f64-5717-4562-b3fc-2c963ffa6f64',
            name: 'Test Inventory 2',
            price: '90.30',
            totalQuantity: 8,
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
  async getItemsByEventId(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: OffsetPaginationParamsDto,
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const { items, totalCountResult } =
      await this.inventoryService.getItemsByEventId(eventId, skip, limit);

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
