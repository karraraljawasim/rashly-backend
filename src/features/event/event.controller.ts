import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { RoleGuard } from '../../shared/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../user/enums/user-role.enum';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventService.create(createEventDto);
  }

  @Get()
  async getAll() {
    return await this.eventService.getAll();
  }

  @Get(':eventId')
  async getById(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return await this.eventService.getById(eventId);
  }

  @Delete(':eventId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async deleteById(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return await this.eventService.deleteById(eventId);
  }

  @Patch(':eventId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async updateById(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.eventService.updateById(eventId, updateEventDto);
  }
}
