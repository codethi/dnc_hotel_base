import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as fs from 'fs';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof BadRequestException) {
          const request = context.switchToHttp().getRequest();
          const file = request.file;
          if (file) {
            fs.unlink(file.path, (unlinkErr) => {
              if (unlinkErr) console.error('Error removing file:', unlinkErr);
            });
          }
        }
        return throwError(() => err);
      }),
    );
  }
}
