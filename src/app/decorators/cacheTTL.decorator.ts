import { SetMetadata } from '@nestjs/common';
// ttl in second
export const CacheTTL = (ttl: number): MethodDecorator & ClassDecorator => SetMetadata('cacheTTL', ttl);
