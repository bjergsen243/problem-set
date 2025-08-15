import { registerAs } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModuleOptions } from '@nestjs/bull';

export default registerAs('redis', () => {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  };
});

@Injectable()
export class RedisConfig {
  constructor(private configService: ConfigService) {}

  getBullConfig(queueName: string): BullModuleOptions {
    return {
      name: queueName,
      redis: {
        host: this.configService.get<string>('redis.host'),
        port: this.configService.get<number>('redis.port'),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    };
  }
}
