import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventRepository } from './event.repository';

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
}
