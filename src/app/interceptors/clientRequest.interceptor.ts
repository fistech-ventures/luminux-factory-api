import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ClientRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.method === 'GET') {
      const query: any = {};
      Object.assign(query, request.query); // ✅ Works!
      if (query?.limit) {
        query.limit = parseInt(query.limit);
        if (query.limit > 100) {
          throw new BadRequestException('Requested limit is too high.');
        }
        if (query.limit < 1) {
          query.limit = 1;
        }
      }
      query.isActive = true;
      Object.assign(request.query, query); // ✅ Works!
    }
    return next.handle();
  }
}
