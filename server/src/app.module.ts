import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppConfigModule } from './config/config.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { FriendsModule } from './friends/friends.module.js';
import { SudokuModule } from './sudoku/sudoku.module.js';
import { DailyModule } from './daily/daily.module.js';
import { BattlesModule } from './battles/battles.module.js';
import { RatingsModule } from './ratings/ratings.module.js';
import { LeaderboardModule } from './leaderboard/leaderboard.module.js';
import { HealthModule } from './health/health.module.js';

import { RedisModule } from './redis/redis.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,

    EventEmitterModule.forRoot(),

    AuthModule,
    UsersModule,
    FriendsModule,
    SudokuModule,
    DailyModule,
    BattlesModule,
    RatingsModule,
    LeaderboardModule,
    HealthModule,
    RedisModule,

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 100,
        },
      ],
    }),
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
