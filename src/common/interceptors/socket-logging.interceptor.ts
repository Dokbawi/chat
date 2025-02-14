import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SocketLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const eventName = context.switchToWs().getPattern();  


    console.log(`[${new Date().toISOString()}] Event: ${eventName}`);
    console.log('Payload:', data);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        console.log(`[${new Date().toISOString()}] Event ${eventName} completed in ${duration}ms`);
      }),
    );
  }
}