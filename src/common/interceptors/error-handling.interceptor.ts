import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';
Injectable();
export class ErrorHandlingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    console.log('ErrorHandlingInterceptor executado. ANTES');
    //await new Promise(resolve => setTimeout(resolve, 3000));
    return next.handle().pipe(
      catchError(error => {
        console.log(error.name);
        console.log(error.message);
        return throwError(() => {
          if (error.name === 'NotFoundException') {
            return new NotFoundException(error.message);
          }
          return new BadRequestException('Ocorreu um erro desconhecido.');
        });
      }),
    );
  }
}
