import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';
import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';
const logger = new Logger('RedisProvider');

export const redisProviders: Provider[] = [
  {
    provide: REDIS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const scriptPath = path.join(
        process.cwd(),
        'src/features/inventory/lua/reserve.lua',
      );
      const reserveScript = fs.readFileSync(scriptPath, 'utf8');
      try {
        const redis = new Redis(configService.get<string>('REDIS_URL')!);
        redis.defineCommand('reserveStock', {
          numberOfKeys: 1,
          lua: reserveScript,
        });

        logger.log('Redis connected.');
        return redis;
      } catch (error) {
        logger.error('Redis connection error');
        throw error;
      }
    },
  },
];
