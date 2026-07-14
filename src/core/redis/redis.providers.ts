import Redis from 'ioredis';
import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';
const logger = new Logger('RedisProvider');

export const redisProviders: Provider[] = [
  {
    provide: REDIS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      try {
        const redis = new Redis(configService.get<string>('REDIS_URL')!);
        logger.log('Redis connected.');
        return redis;
      } catch (error) {
        logger.error('Redis connection error');
        throw error;
      }
    },
  },
];
