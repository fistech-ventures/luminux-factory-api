import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ENV } from '@src/env';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { Observable } from 'rxjs';

@Injectable()
export class InternalRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (ENV.auth.skipAuth) return next.handle();
    // Validate if verifiedUser exists
    if (!request.verifiedUser) {
      throw new ForbiddenException(
        'Unauthorized access: All internal request requires verified user.',
      );
    }

    // Validate if verifiedUser has roles and one of them is 'internal'
    const roles = request.verifiedUser.roles || [];
    if (!roles.includes(ENUM_ACL_DEFAULT_ROLES.INTERNAL)) {
      throw new ForbiddenException(
        'Unauthorized access: Your role does not have the necessary clearence to make this request!.',
      );
    }
    return next.handle();
  }
}
