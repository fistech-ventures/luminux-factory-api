import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ENV } from '@src/env';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RedisCacheService } from '../modules/@redis/redisCache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(RedisCacheService) private readonly redisService: RedisCacheService,
    private readonly reflector: Reflector,
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (!ENV.redis.cache.isEnabled) return next.handle();
    console.warn(`CacheInterceptor triggered for ${context.switchToHttp().getRequest().url}`);
    const handler = context.getHandler();
    const request: Request = context.switchToHttp().getRequest();

    const revalidateKeys = this.reflector.get<string[]>('cacheRevalidateKeys', handler);

    // Handle cache invalidation
    if (revalidateKeys?.length) {
      for (const reKey of revalidateKeys) {
        const pattern = this.getDynamicKey(context, reKey);
        console.warn(`Invalidating cache with pattern: ${pattern}`);
        await this.redisService.delKey(pattern);
      }
      return next.handle();
    }

    const cacheKeyPrefix = this.reflector.get<string>('cacheKey', handler);
    if (!cacheKeyPrefix) {
      console.error(`Cache key not found, API End point: ${request?.url}`);
      return next.handle();
    }
    const key = this.getCacheKey(context, cacheKeyPrefix);
    const ttl = this.reflector.get<number>('cacheTTL', handler) || 300;

    // Try serving from cache
    try {
      const cached = await this.redisService.getKey(key);
      if (cached) {
        return of(cached);
      }
    } catch (err) {
      console.error(`Redis getKey failed: ${err.message}`);
    }

    // Set cache after response
    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.redisService.setKey(key, response, ttl);
          console.warn(`Cache set for key: ${key} with TTL: ${ttl}s`);
        } catch (err) {
          console.error(`Redis setKey failed: ${err.message}`);
        }
      }),
      catchError((err) => {
        console.error(`Handler error: ${err.message}`);
        throw err;
      }),
    );
  }

  private getCacheKey(context: ExecutionContext, prefix: string): string {
    const { method, url, query, params } = context.switchToHttp().getRequest();
    let key = `${ENV.env}_${prefix}`;

    Object.entries(params).forEach(([k, v]) => {
      key = key.replace(`{${k}}`, String(v));
    });

    key += `_${method}:${url}`;

    if (Object.keys(query).length) {
      key += `?${new URLSearchParams(query).toString()}`;
    }

    return key;
  }

  private getDynamicKey(context: ExecutionContext, prefix: string): string {
    const { _method, _url, _query, params } = context.switchToHttp().getRequest(); let key = `${ENV.env}_${prefix}`;

    Object.entries(params).forEach(([k, v]) => {
      key = key.replace(`{${k}}`, String(v));
    });

    key += `_GET*`;

    return key;
  }

}
