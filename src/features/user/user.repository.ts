import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import * as schema from '../../core/database/schema';
import { users } from './schema/user.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }) {
    const [result] = await this.db.insert(users).values(data).returning();
    if (!result) {
      throw new InternalServerErrorException('Could not create user');
    }

    return result;
  }

  async findByEmail(email: string) {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result;
  }

  async findById(id: string) {
    const [result] = await this.db.select().from(users).where(eq(users.id, id));

    return result;
  }
}
