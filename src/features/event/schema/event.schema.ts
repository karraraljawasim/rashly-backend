import { pgTable, text, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { InferSelectModel } from 'drizzle-orm';

export const events = pgTable('events', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  saleStartsAt: timestamp('sale_starts_at').notNull(),
  saleEndsAt: timestamp('sale_ends_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type EventRows = InferSelectModel<typeof events>;
