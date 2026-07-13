import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/database/schema';
import { bookings } from './schema/booking.schema';
import { CreateBookingData } from './types/create-booking-data.types';
import { and, eq, sum, inArray, count } from 'drizzle-orm';
import { BookingStatus } from './enums/booking-status.enum';
import { inventoryItems } from '../../core/database/schema';

@Injectable()
export class BookingRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateBookingData) {
    return await this.db.transaction(async (tx) => {
      const [inventory] = await tx
        .select({ totalQuantity: inventoryItems.totalQuantity })
        .from(inventoryItems)
        .where(eq(inventoryItems.id, data.inventoryItemId))
        .for('update');

      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }

      const [booking] = await tx
        .select({
          sumQuantity: sum(bookings.quantity),
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.inventoryItemId, data.inventoryItemId),
            inArray(bookings.status, [
              BookingStatus.Pending,
              BookingStatus.Confirmed,
            ]),
          ),
        );

      let reservedSum = 0;
      if (booking) {
        reservedSum = booking.sumQuantity ? parseInt(booking.sumQuantity) : 0;
      }

      const remaining = inventory.totalQuantity - reservedSum;
      if (remaining < data.quantity) {
        throw new BadRequestException('Out of stack');
      }

      const [result] = await tx.insert(bookings).values(data).returning();

      return result;
    });
  }

  async findById(bookingId: string) {
    const [result] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    return result;
  }

  async findBookingsByUserId(userId: string, skip: number, limit: number) {
    return await Promise.all([
      this.db
        .select({ totalCount: count() })
        .from(bookings)
        .where(eq(bookings.userId, userId)),
      this.db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId))
        .orderBy(bookings.id)
        .offset(skip)
        .limit(limit),
    ]);
  }

  async cancelBooking(bookingId: string) {
    const [result] = await this.db
      .update(bookings)
      .set({
        status: BookingStatus.Canceled,
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return result;
  }
}
