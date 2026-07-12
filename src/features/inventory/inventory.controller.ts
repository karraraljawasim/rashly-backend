import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../user/enums/user-role.enum';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Patch(':inventoryId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async updateById(
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Param('inventoryId', ParseUUIDPipe) inventoryId: string,
  ) {
    return await this.inventoryService.updateById(
      inventoryId,
      updateInventoryDto,
    );
  }

  @Delete(':inventoryId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async deleteById(@Param('inventoryId', ParseUUIDPipe) inventoryId: string) {
    return await this.inventoryService.deleteById(inventoryId);
  }

  @Get(':inventoryId')
  async getById(@Param('inventoryId', ParseUUIDPipe) inventoryId: string) {
    return await this.inventoryService.getById(inventoryId);
  }
}
