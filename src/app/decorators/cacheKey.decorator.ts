import { SetMetadata } from '@nestjs/common';

export const CacheKey = (key: string): MethodDecorator => SetMetadata('cacheKey', key);
