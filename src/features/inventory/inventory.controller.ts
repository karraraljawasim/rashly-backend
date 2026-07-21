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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('inventory')
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
@ApiResponse({
  status: 401,
  description: 'Not Found: Inventory with this id is not found.',
})
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Patch(':inventoryId')
  @ApiOperation({ summary: 'Update inventory.' })
  @ApiResponse({
    status: 200,
    description: 'Update and return updated inventory successfully.',
    schema: {
      example: {
        success: true,
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          eventId: '45625f64-5717-63f6-b3fc-2c963f66afa6',
          name: 'Updated Inventory',
          price: '89.00',
          totalQuantity: 5,
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You do not have the right permissions.',
  })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Delete inventory.' })
  @ApiResponse({
    status: 200,
    description: 'Delete inventory successfully.',
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async deleteById(@Param('inventoryId', ParseUUIDPipe) inventoryId: string) {
    return await this.inventoryService.deleteById(inventoryId);
  }

  @Get(':inventoryId')
  @ApiOperation({ summary: 'Get inventory details.' })
  @ApiResponse({
    status: 200,
    description: 'Return inventory successfully.',
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
    status: 401,
    description: 'Not Found: Event with this id is not found.',
  })
  async getById(@Param('inventoryId', ParseUUIDPipe) inventoryId: string) {
    return await this.inventoryService.getById(inventoryId);
  }
}
