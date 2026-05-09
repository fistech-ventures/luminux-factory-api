import { SetMetadata } from '@nestjs/common';

export const CACHE_REVALIDATE_KEYS = 'cacheRevalidateKeys';
export const CacheRevalidateKeys = (keys: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata('cacheRevalidateKeys', keys);
