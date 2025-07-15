import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({ success: true, data })),
      catchError(err => {
        // If error is already formatted, pass it through
        if (err.response && typeof err.response === 'object' && 'success' in err.response) {
          throw err
        }
        throw {
          ...err,
          response: { success: false, error: err.message || err }
        }
      })
    )
  }
} 