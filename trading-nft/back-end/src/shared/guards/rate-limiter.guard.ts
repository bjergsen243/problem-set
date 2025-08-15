import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RateLimiterGuard extends ThrottlerGuard {
  constructor(
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    const options: ThrottlerModuleOptions = {
      throttlers: [{
        ttl: 60,
        limit: 100,
      }],
    };
    super(options, storageService, reflector);
  }

  protected errorMessage = 'Too Many Requests';
} 