import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { events } from '../../event/schema/event.schema';
import { InferSelectModel } from 'drizzle-orm';

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id),
    name: varchar('name', { length: 255 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    totalQuantity: integer('total_quantity').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('event_id_idx').on(table.eventId)],
);

export type InventoryRows = InferSelectModel<typeof inventoryItems>;
