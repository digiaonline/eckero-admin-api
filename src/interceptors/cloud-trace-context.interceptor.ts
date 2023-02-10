/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import {Observable} from 'rxjs';
import {ClsService} from 'nestjs-cls';

@Injectable()
export class CloudTraceContextInterceptor implements NestInterceptor {
  constructor(
    private clsService: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const traceContext = request.header('X-Cloud-Trace-Context');
    if (traceContext) {
      this.clsService.set('GCLOUD_TRACE_CONTEXT', traceContext);
    }
    return next.handle();
  }
}
