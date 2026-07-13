import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventRepository } from './event.repository';
import { UpdateEventDto } from './dto/update-event.dto';
import { OffsetPaginationParamsDto } from '../../shared/dto/offset-pagination-params.dto';

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

  async getAll(pagination: OffsetPaginationParamsDto) {
    const limit = pagination.limit || 10;
    const currentPage = pagination.page || 1;
    const skip = (currentPage - 1) * limit;

    const [count, data] = await this.eventRepository.getAll(skip, limit);

    const totalItems = count[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: data,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage: limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
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
