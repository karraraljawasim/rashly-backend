import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { users } from '../../user/schema/user.schema';

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createAt: timestamp('created_at').notNull().defaultNow(),
});
