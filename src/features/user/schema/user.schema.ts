import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { Role } from '../enums/user-role.enum';

export const userRoleEnum = pgEnum('user_role_enum', [Role.User, Role.Admin]);

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  fullName: varchar('full_name').notNull(),
  email: varchar('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default(Role.User),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type UserRows = InferSelectModel<typeof users>;
