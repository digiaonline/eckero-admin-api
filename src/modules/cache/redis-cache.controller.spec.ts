/* eslint-disable @typescript-eslint/no-unused-vars */
import {Test} from '@nestjs/testing';
import {ClsModule} from 'nestjs-cls';
import {ConfigModule} from '@nestjs/config';
import {RedisCacheController} from './redis-cache.controller';
import {RedisCacheService} from './redis-cache.service';
import {CacheModule} from '@nestjs/common';
import {LoggerModule} from '@utils/logger/logger.module';
import {TimerModule} from '@utils/timer/timer.module';

describe('RedisCacheController', () => {
  let redisCacheController: RedisCacheController;
  let redisCacheService: RedisCacheService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TimerModule,
        LoggerModule,
        CacheModule.register(),
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
          },
        }),
        ConfigModule.forRoot({
          envFilePath: '.env.test'
        }),
      ],
      controllers: [RedisCacheController],
      providers: [RedisCacheService],
    })
      .compile();

    redisCacheService = moduleRef.get<RedisCacheService>(RedisCacheService);
    redisCacheController = moduleRef.get<RedisCacheController>(RedisCacheController);
  });

  describe('clearCache', () => {
    it('should resolve', async () => {
       await expect(redisCacheController.clearCache()).resolves;
    });
  });
});
