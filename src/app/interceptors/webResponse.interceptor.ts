import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WebResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.filterAdminFields(data);
      }),
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
