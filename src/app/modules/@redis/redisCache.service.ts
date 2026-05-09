import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ENV } from '@src/env';
import * as Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  constructor() {
    this.redisConfig.password = ENV.redis.cache.storePassword
    // if (!ENV.isDevelopment)
    //   this.redisConfig.username = ENV.redis.cache.storeUsername

    this.redisClient = new Redis.Redis(this.redisConfig);

    this.redisClient.on('connect', () => {
      this.redisConnected = true;
      console.info('Redis connected to save cache');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }
  private redisClient: Redis.Redis;
  private redisConnected = false;
  private redisConfig: any = {
    host: ENV.redis.cache.storeHost,
    port: ENV.redis.cache.storePort,
    maxRetriesPerRequest: 1,
    // ...(!ENV.redis.cache.storeHost?.startsWith('localhost')
    //   ? { tls: { rejectUnauthorized: false } }
    //   : {}),
  };

  async setKey(key: string, value: any, ttl: number = 30000): Promise<void> {
    try {
      await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  }

  async getKey(key: string): Promise<any> {
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async delKey(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Error deleting keys matching ${pattern}:`, error);
    }
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }
}
