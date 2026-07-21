import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/database/schema';
import { bookings } from './schema/booking.schema';
import { CreateBookingData } from './types/create-booking-data.types';
import { eq, count } from 'drizzle-orm';
import { BookingStatus } from './enums/booking-status.enum';

@Injectable()
export class BookingRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateBookingData) {
    const [result] = await this.db.insert(bookings).values(data).returning();
    if (!result) {
      throw new InternalServerErrorException('Create booking failed');
    }

    return result;
  }

  async findById(bookingId: string) {
    const [result] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    return result;
  }

  async findBookingsByUserId(userId: string, skip: number, limit: number) {
    const [totalCountResult, items] = await Promise.all([
      this.db
        .select({ totalCount: count() })
        .from(bookings)
        .where(eq(bookings.userId, userId)),
      this.db
        .select({
          id: bookings.id,
          quantity: bookings.quantity,
          status: bookings.status,
          holdExpiresAt: bookings.holdExpiresAt,
        })
        .from(bookings)
        .where(eq(bookings.userId, userId))
        .orderBy(bookings.id)
        .offset(skip)
        .limit(limit),
    ]);

    return { items, totalCountResult: totalCountResult[0]?.totalCount || 0 };
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

  async updateStatus(bookingId: string, status: BookingStatus) {
    await this.db
      .update(bookings)
      .set({ status: status })
      .where(eq(bookings.id, bookingId));
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    const [result] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.idempotencyKey, idempotencyKey));

    return result;
  }
}
