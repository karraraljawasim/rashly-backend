import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/database/schema';
import { inventoryItems } from './schema/inventory.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class InventoryRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: {
    name: string;
    eventId: string;
    price: string;
    totalQuantity: number;
  }) {
    const [result] = await this.db
      .insert(inventoryItems)
      .values({
        eventId: data.eventId,
        name: data.name,
        price: data.price,
        totalQuantity: data.totalQuantity,
      })
      .returning();
    if (!result) {
      throw new InternalServerErrorException('Create inventor failed');
    }

    return result;
  }

  async getItemsByEventId(eventId: string) {
    return this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.eventId, eventId));
  }

  async findById(inventoryId: string) {
    const [result] = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, inventoryId));

    return result;
  }

  async deleteById(inventoryId: string) {
    return this.db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, inventoryId));
  }

  async updateById(
    inventoryId: string,
    data: {
      name?: string;
      eventId?: string;
      price?: string;
      totalQuantity?: number;
    },
  ) {
    return this.db
      .update(inventoryItems)
      .set(data)
      .where(eq(inventoryItems.id, inventoryId))
      .returning();
  }
}
