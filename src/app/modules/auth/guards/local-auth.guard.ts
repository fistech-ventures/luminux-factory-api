import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@src/app/decorators/publicRoute.decorator';
import { JWTHelper } from '@src/app/helpers';
import { ENV } from '@src/env';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtHelper: JWTHelper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true; // 🚀 Skip auth for public routes
    if (ENV.auth.skipAuth) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.jwtHelper.extractToken(request.headers);

    const verifiedUser: any = await this.jwtHelper.verify(token);
    if (!verifiedUser) {
      throw new UnauthorizedException('Unauthorized Access Detected');
    }

    request['verifiedUser'] = verifiedUser.user;
    return true;
  }
}
