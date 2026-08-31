import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { DailyService } from './daily.service.js';

import { GetDailyChallengeDto } from './dto/get-daily-challenge.dto.js';

import { GetDailyLeaderboardDto } from './dto/get-daily-leaderboard.dto.js';

import { SubmitDailyAttemptDto } from './dto/submit-daily-attempt.dto.js';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

import { toPrismaSudokuVariant } from '../sudoku/sudoku-variant.js';

@Controller('daily')
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  @Get('today')
  getToday(
    @CurrentUser()
    user: AuthenticatedUser,

    @Query()
    query: GetDailyChallengeDto,
  ) {
    return this.dailyService.getToday(
      user.sub,
      toPrismaSudokuVariant(query.variant),
    );
  }

  @Post(':challengeId/attempt')
  submitAttempt(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('challengeId')
    challengeId: string,

    @Body()
    dto: SubmitDailyAttemptDto,
  ) {
    return this.dailyService.submitAttempt(
      user.sub,
      challengeId,
      dto.completionTimeMs,
      dto.board,
    );
  }

  @Get(':challengeId/leaderboard')
  getLeaderboard(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('challengeId')
    challengeId: string,

    @Query()
    query: GetDailyLeaderboardDto,
  ) {
    return this.dailyService.getLeaderboard(challengeId, user.sub, query.scope);
  }
}
