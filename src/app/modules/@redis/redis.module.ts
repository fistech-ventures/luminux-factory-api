import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheService } from '@src/app/modules/@redis/redisCache.service';
import { CacheKey } from './cacheKey.entity';

const entities = [CacheKey];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([...entities])],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}
