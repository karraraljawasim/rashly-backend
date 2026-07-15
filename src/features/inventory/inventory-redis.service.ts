import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../core/redis/redis.providers';
import { REDIS_KEYS } from '../../core/redis/redis.keys';

export interface RedisWithCustomCommands extends Redis {
  reserveStock(key: string, requestedQuantity: number): Promise<number>;
}

@Injectable()
export class InventoryRedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisWithCustomCommands,
  ) {}

  async reserve(inventoryItemId: string, quantity: number) {
    const result = await this.redisClient.reserveStock(
      REDIS_KEYS.inventory.available(inventoryItemId),
      quantity,
    );

    if (result === -1) return 'not_initialized';
    if (result === -2) return 'sold_out';
    return 'reserved';
  }

  async release(inventoryItemId: string, quantity: number) {
    await this.redisClient.incrby(
      REDIS_KEYS.inventory.available(inventoryItemId),
      quantity,
    );
  }

  async syncInventoryToRedis(
    items: {
      id: string;
      totalQuantity: number;
      reservedQuantity: number;
    }[],
  ) {
    if (items.length === 0) return;

    const pipeline = this.redisClient.pipeline();

    for (const item of items) {
      const availableQuantity = item.totalQuantity - item.reservedQuantity;
      const stock = Math.max(0, availableQuantity);

      pipeline.set(REDIS_KEYS.inventory.available(item.id), stock);
    }

    await pipeline.exec();
  }
}
