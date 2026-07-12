import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import * as schema from '../../core/database/schema';
import { events } from './schema/event.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class EventRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    saleStartsAt: Date;
    saleEndsAt?: Date;
  }) {
    const [result] = await this.db.insert(events).values(data).returning();
    if (!result) {
      throw new InternalServerErrorException('Create event failed');
    }

    return result;
  }

  async getAll() {
    return this.db.select().from(events);
  }

  async findById(eventId: string) {
    const [result] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    return result;
  }

  async deleteById(eventId: string) {
    await this.db.delete(events).where(eq(events.id, eventId));
  }

  async updateById(
    eventId: string,
    data: {
      name?: string;
      description?: string;
      saleStartsAt?: Date;
      saleEndsAt?: Date;
    },
  ) {
    const [result] = await this.db
      .update(events)
      .set(data)
      .where(eq(events.id, eventId))
      .returning();

    return result;
  }
}
