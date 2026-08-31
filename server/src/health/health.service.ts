import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async check() {
    let database = 'ok';
    let redis = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'error';
    }

    try {
      await this.redisService.setWithExpiry('health:check', 'ok', 10);

      const value = await this.redisService.get('health:check');

      if (value !== 'ok') {
        redis = 'error';
      }
    } catch {
      redis = 'error';
    }

    return {
      status: database === 'ok' && redis === 'ok' ? 'ok' : 'degraded',

      database,
      redis,

      timestamp: new Date().toISOString(),
    };
  }
}
