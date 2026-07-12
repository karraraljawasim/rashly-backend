import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventRepository } from './event.repository';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private eventRepository: EventRepository) {}

  async create(dto: CreateEventDto) {
    return await this.eventRepository.create({
      name: dto.name,
      description: dto.description,
      saleStartsAt: dto.saleStartsAt,
      saleEndsAt: dto.saleEndsAt,
    });
  }

  async getAll() {
    return this.eventRepository.getAll();
  }

  async getById(eventId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async deleteById(eventId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.eventRepository.deleteById(eventId);

    return;
  }

  async updateById(eventId: string, dto: UpdateEventDto) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return await this.eventRepository.updateById(eventId, dto);
  }
}
