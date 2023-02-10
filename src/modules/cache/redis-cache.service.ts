import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {LoggerService} from '@utils/logger/logger.service';
import {TimerService} from '@utils/timer/timer.service';
import {Cache} from 'cache-manager';
import {gzipSync, unzipSync} from 'zlib';

@Injectable()
export class RedisCacheService {
    constructor (
        @Inject(CACHE_MANAGER) private redisCache: Cache,
        private loggerService: LoggerService,
        private timerService: TimerService,
      ) {
      }

    async clearCache(): Promise<void> {
      return await this.redisCache.reset();
    }

    async get<T>(key: string): Promise<T | undefined> {
      const timer = this.timerService.start();
      const value: T | Buffer | Record<string, unknown> = await this.redisCache.get(key);
      const duration = this.timerService.end(timer);
      this.loggerService.debug(`get ${key} with status ${!!value ? 'HIT' : 'MISS'} in ${duration}ms`);
      if (!value) return undefined;
      if (this.isRecord(value)) return value as T;
      return JSON.parse(unzipSync(value as ArrayBuffer).toString('utf-8')) as T;
    }
  
    async set<T>(key: string, value: T, ttl?: number): Promise<unknown> {
      this.loggerService.debug(`set ${key} with ${ttl ? `ttl: ${ttl}`: 'default options'}`);
      const encoded = gzipSync(JSON.stringify(value));
      return await this.redisCache.set(key, encoded, ttl);
    }

    private isRecord(obj: Record<string, unknown> | unknown): obj is Record<string, unknown> {
      return typeof obj === 'object' && 'key' in obj;
    }
}
