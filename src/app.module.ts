import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ClsModule} from 'nestjs-cls';
import {CloudTraceContextInterceptor} from './interceptors/cloud-trace-context.interceptor';
import {RedisCacheModule} from './modules/cache/redis-cache.module';
import {LoggerModule} from './utils/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    ConfigModule.forRoot(), 
    RedisCacheModule,
  ],
  controllers: [],
  providers: [ {
    provide: APP_INTERCEPTOR,
    useClass: CloudTraceContextInterceptor,
  }],
})
export class AppModule {}
