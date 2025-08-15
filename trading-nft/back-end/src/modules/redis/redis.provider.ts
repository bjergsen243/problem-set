import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export type RedisClient = Redis;

export const redisProvider: Provider = {
  useFactory: (config: ConfigService): RedisClient => {
    return new Redis({
      host: config.get('redis.host'),
      port: config.get('redis.port'),
    });
  },
  inject: [ConfigService],
  provide: 'REDIS_CLIENT',
};
