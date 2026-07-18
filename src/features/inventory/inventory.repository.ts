import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/database/schema';
import { inventoryItems } from './schema/inventory.schema';
import { and, count, eq, inArray, sql } from 'drizzle-orm';
import { bookings } from '../../core/database/schema';
import { BookingStatus } from '../booking/enums/booking-status.enum';

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

  async getItemsByEventId(eventId: string, skip: number, limit: number) {
    const [totalCountResult, items] = await Promise.all([
      this.db
        .select({ totalCount: count() })
        .from(inventoryItems)
        .where(eq(inventoryItems.eventId, eventId)),
      this.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.eventId, eventId))
        .offset(skip)
        .limit(limit),
    ]);

    return { items, totalCountResult: totalCountResult[0]?.totalCount || 0 };
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
    const [result] = await this.db
      .update(inventoryItems)
      .set(data)
      .where(eq(inventoryItems.id, inventoryId))
      .returning();

    return result;
  }

  async getActiveStockCounts() {
    return this.db
      .select({
        id: inventoryItems.id,
        totalQuantity: inventoryItems.totalQuantity,
        reservedQuantity:
          sql<number>`COALESCE(SUM(${bookings.quantity}), 0)`.mapWith(Number),
      })
      .from(inventoryItems)
      .leftJoin(
        bookings,
        and(
          eq(inventoryItems.id, bookings.inventoryItemId),
          inArray(bookings.status, [
            BookingStatus.Pending,
            BookingStatus.Confirmed,
          ]),
        ),
      )
      .groupBy(inventoryItems.id, inventoryItems.totalQuantity);
  }
}
