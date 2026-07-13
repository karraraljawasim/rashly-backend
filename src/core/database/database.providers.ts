import { drizzle } from 'drizzle-orm/node-postgres';
import { Provider, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
const logger = new Logger('DatabaseProvider');
export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const pool = new Pool({
        connectionString: configService.get<string>('DATABASE_URL'),
      });
      try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        logger.log('Database Connected');
      } catch (error) {
        logger.error('Failed to connect to the database');
        await pool.end();
        throw error;
      }

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
