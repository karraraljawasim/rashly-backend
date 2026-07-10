import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../core/database/database.providers';
import * as schema from '../../core/database/schema';
import { refreshTokens } from './schema/auth.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async storeRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    await this.db.insert(refreshTokens).values(data);

    return;
  }

  async findRefreshTokenByHash(tokenHash: string) {
    const [result] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));

    return result;
  }

  async deleteRefreshToken(tokenHash: string) {
    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }
}
