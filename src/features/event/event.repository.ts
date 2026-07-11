import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import * as schema from '../../core/database/schema';
import { events } from './schema/event.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

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

  findAll() {
    return this.db.select().from(events);
  }
}
