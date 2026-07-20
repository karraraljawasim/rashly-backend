import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function resetDatabase(db: NodePgDatabase) {
  await db.execute(
    sql`TRUNCATE TABLE bookings, inventory_items, events, users, refresh_tokens RESTART IDENTITY CASCADE`,
  );
}
