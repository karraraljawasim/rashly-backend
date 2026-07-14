import { Global, Module } from '@nestjs/common';
import { REDIS_CLIENT, redisProviders } from './redis.providers';

@Global()
@Module({
  providers: [...redisProviders],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
