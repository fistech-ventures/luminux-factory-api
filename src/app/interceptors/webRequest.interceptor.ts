import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WebRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request?.verifiedUser) {
      // Validate if verifiedUser has roles and one of them is 'worker'
      const roles = request.verifiedUser.roles || [];
      if (!roles.includes(ENUM_ACL_DEFAULT_ROLES.CUSTOMER)) {
        throw new ForbiddenException(
          'Unauthorized access: Your role does not have the necessary clearence to make this request!.',
        );
      }
    }

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
    return next.handle().pipe(
      map((data) => this.filterAdminFields(data)),
    );
  }

  private filterAdminFields(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.filterAdminFields(item));
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
      const { createdBy, updatedBy, deletedAt, ...filteredData } = data;

      // Recursively filter nested objects
      const result: any = {};
      for (const key in filteredData) {
        if (filteredData.hasOwnProperty(key)) {
          result[key] = this.filterAdminFields(filteredData[key]);
        }
      }

      return result;
    }

    return data;
  }
}
