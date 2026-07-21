import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import * as schema from '../../core/database/schema';
import { events } from './schema/event.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, count } from 'drizzle-orm';

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

  async getAll(skip: number, limit: number) {
    const [totalCountResult, items] = await Promise.all([
      this.db.select({ totalCount: count() }).from(events),
      this.db
        .select({
          id: events.id,
          name: events.name,
          saleStartsAt: events.saleStartsAt,
        })
        .from(events)
        .orderBy(events.id)
        .offset(skip)
        .limit(limit),
    ]);

    return { items, totalCountResult: totalCountResult[0]?.totalCount || 0 };
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
