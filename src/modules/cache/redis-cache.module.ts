import {CacheModule, CacheStore, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {RedisCacheController} from '@modules/cache/redis-cache.controller';
import {RedisCacheService} from '@modules/cache/redis-cache.service';
import {redisStore} from 'cache-manager-redis-store';
import {TimerModule} from '@root/src/utils/timer/timer.module';
import {LoggerModule} from '@root/src/utils/logger/logger.module';

@Module({
    imports: [CacheModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => (
            {
                store: redisStore as unknown as CacheStore,
                socket: {
                    host: configService.get<string>('REDIS_HOST') || 'localhost',
                    port: Number(configService.get<number>('REDIS_PORT')) || 6379,
                },
                ttl: Number(configService.get<number>('REDIS_DEFAULT_TTL')) || 3600,
            }),
        inject: [ConfigService]
    }), TimerModule, LoggerModule],
    controllers: [RedisCacheController],
    providers: [RedisCacheService],
})
export class RedisCacheModule {}
