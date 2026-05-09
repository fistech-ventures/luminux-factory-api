import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class GlobalRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    // return next.handle().pipe(
    // map((response) => {
    const request = context.switchToHttp().getRequest();
    const validatedBody = request.body;
    if (validatedBody && typeof validatedBody === 'object' && request.verifiedUser) {
      if (request.method === 'POST') {
        validatedBody.createdBy = request?.verifiedUser; // ✅ Modify after validation
      } else if (request.method === 'PUT' || request.method === 'PATCH') {
        validatedBody.updatedBy = request?.verifiedUser;
      } else if (request.method === 'DELETE') {
        validatedBody.deletedBy = request?.verifiedUser ?? null;
      }

      // Replace the request.body with the enriched version
      request.body = validatedBody;
    }
    // return response;
    // }),
    // );
    return next.handle();
  }
}
