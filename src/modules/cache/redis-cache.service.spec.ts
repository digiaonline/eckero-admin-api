/* eslint-disable @typescript-eslint/no-unused-vars */
import {Test} from '@nestjs/testing';
import {ClsModule} from 'nestjs-cls';
import {ConfigModule} from '@nestjs/config';
import {RedisCacheController} from './redis-cache.controller';
import {RedisCacheService} from './redis-cache.service';
import {CacheModule} from '@nestjs/common';
import {LoggerModule} from '@utils/logger/logger.module';
import {TimerModule} from '@utils/timer/timer.module';

describe('RedisCacheService', () => {
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
  });

  describe('set get', () => {
    it('should give an object if object is stored', async () => {
        const expected = {
            name: 'test',
            value: 10,
        };
        await redisCacheService.set('test', expected);
        const result = await redisCacheService.get('test');
        expect(result).toStrictEqual(expected);
    });

    it('should give an boolean if boolean is stored', async () => {
        const expected = true;
        await redisCacheService.set('test', expected);
        const result = await redisCacheService.get('test');
        expect(result).toBe(expected);
    });
  });

  describe('clearCache', () => {
    it('should clear redis cache', async () => {
        const firstObject = {
            name: 'test',
            value: 10,
        };

        const secondObject = true;

        await redisCacheService.set('first', firstObject);
        await redisCacheService.set('second', secondObject);

        await redisCacheService.clearCache();

        const firstResult = await redisCacheService.get('first');
        const secondResult = await redisCacheService.get('second');

        expect(firstResult).toBe(undefined);
        expect(secondResult).toBe(undefined);
    });
  });
});
