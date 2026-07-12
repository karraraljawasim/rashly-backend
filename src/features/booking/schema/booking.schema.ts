import {
  pgTable,
  uuid,
  varchar,
  integer,
  pgEnum,
  timestamp,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { users } from '../../user/schema/user.schema';
import { inventoryItems } from '../../inventory/schema/inventory.schema';
import { BookingStatus } from '../enums/booking-status.enum';

export const bookingStatusEnum = pgEnum('booking_status_enum', [
  BookingStatus.Pending,
  BookingStatus.Canceled,
  BookingStatus.Expired,
  BookingStatus.Confirmed,
]);

export const bookings = pgTable('bookings', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  inventoryItemId: uuid('inventory_item_id')
    .notNull()
    .references(() => inventoryItems.id),
  quantity: integer('quantity').notNull().default(1),
  status: bookingStatusEnum('status').notNull().default(BookingStatus.Pending),
  idempotencyKey: varchar('idempotencyKey').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
