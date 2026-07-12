import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RoleGuard } from '../../shared/guards/roles.guard';
import { Role } from '../user/enums/user-role.enum';
import { CreateInventoryDto } from './dto/create-inventory.dto';

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
  async getItemsByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return await this.inventoryService.getItemsByEventId(eventId);
  }
}
