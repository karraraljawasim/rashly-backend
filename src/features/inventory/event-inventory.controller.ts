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

@Controller('events/:eventId/inventory')
export class EventInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return await this.inventoryService.create(createInventoryDto, eventId);
  }

  @Get()
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
