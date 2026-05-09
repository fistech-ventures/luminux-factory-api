import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisCacheService } from '../../@redis/redisCache.service';

@Injectable()
export class FingerprintSubmissionGuard implements CanActivate {
  constructor(private readonly redisCacheService: RedisCacheService) { }
  private readonly MAX_SUBMISSIONS = 2;
  private readonly MAX_IP_SUBMISSIONS = 5; // Max requests per IP address
  private readonly TTL_HOURS = 2; // Reset after 24 hours
  private readonly TTL_SECONDS = this.TTL_HOURS * 60 * 60;


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get IP address
    const ipAddress = this.getClientIpAddress(request);

    // Get fingerprint from request body or headers
    const fingerprint = this.getFingerprint(request);

    if (!fingerprint) {
      throw new BadRequestException('Fingerprint is required');
    }

    // Create Redis key using IP and fingerprint
    const redisKey = this.createRedisKey(ipAddress, fingerprint);
    const ipRedisKey = this.createIpRedisKey(ipAddress);

    // Check IP-based submission count first
    const ipSubmissionCount = await this.getCurrentSubmissionCount(ipRedisKey);

    if (ipSubmissionCount >= this.MAX_IP_SUBMISSIONS) {
      throw new ForbiddenException(
        `Maximum ${this.MAX_IP_SUBMISSIONS} submissions allowed per IP address within ${this.TTL_HOURS} hours`,
      );
    }

    // Check current submission count for fingerprint
    const currentCount = await this.getCurrentSubmissionCount(redisKey);

    if (currentCount >= this.MAX_SUBMISSIONS) {
      throw new ForbiddenException(
        `Maximum ${this.MAX_SUBMISSIONS} submissions allowed per fingerprint within ${this.TTL_HOURS} hours`,
      );
    }

    // Increment both IP and fingerprint submission counts
    await this.incrementSubmissionCount(redisKey);
    await this.incrementSubmissionCount(ipRedisKey);

    return true;
  }

  private getClientIpAddress(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private getFingerprint(request: Request): string | null {
    // Try to get fingerprint from different sources
    return request.body?.fingerprint || request.query?.fingerprint || request.headers['x-fingerprint'] || null;
  }

  private createRedisKey(ipAddress: string, fingerprint: string): string {
    // Create a unique key combining IP and fingerprint
    const sanitizedIp = ipAddress.replace(/[^a-zA-Z0-9.-]/g, '_');
    const sanitizedFingerprint = fingerprint.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `fingerprint_submission:${sanitizedIp}:${sanitizedFingerprint}`;
  }

  private createIpRedisKey(ipAddress: string): string {
    // Create a key for IP-based rate limiting
    const sanitizedIp = ipAddress.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `ip_submission:${sanitizedIp}`;
  }

  private async getCurrentSubmissionCount(redisKey: string): Promise<number> {
    try {
      const count = await this.redisCacheService.getKey(redisKey);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting submission count from Redis:', error);
      return 0;
    }
  }

  private async incrementSubmissionCount(redisKey: string): Promise<void> {
    try {
      // Use atomic increment operation
      const newCount = await this.redisCacheService.incr(redisKey);

      // Set expiration for new keys (when count is 1)
      if (newCount === 1) {
        await this.redisCacheService.expire(redisKey, this.TTL_SECONDS);
      }
    } catch (error) {
      console.error('Error incrementing submission count in Redis:', error);
      // Don't throw error here to avoid blocking the request
    }
  }
}
