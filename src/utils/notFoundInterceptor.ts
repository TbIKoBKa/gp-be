import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class NotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        if (!value) {
          const ctx = context.switchToHttp();
          const response = ctx.getResponse<Response>();

          response.status(404).json({
            statusCode: 404,
            error: 'Not Found',
            message: 'pageNotFound',
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return value;
        }
      })
    );
  }
}
