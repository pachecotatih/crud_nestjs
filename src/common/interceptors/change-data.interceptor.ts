import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
@Injectable()
export class ChangeDataInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    return next.handle().pipe(
      map(data => {
        if (Array.isArray(data)) {
          return {
            data,
            count: data.length,
          };
        }
        return data;
      }),
    );
  }
}
