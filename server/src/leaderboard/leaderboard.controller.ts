import { Controller, Get, Query } from '@nestjs/common';

import { LeaderboardService } from './leaderboard.service.js';

import { LeaderboardQueryDto } from './dto/leaderboard-query.dto.js';

import { toPrismaSudokuVariant } from '../sudoku/sudoku-variant.js';

@Controller('leaderboards')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('battle')
  getBattleLeaderboard(
    @Query()
    query: LeaderboardQueryDto,
  ) {
    return this.leaderboardService.getBattleLeaderboard(
      toPrismaSudokuVariant(query.variant),
      query.limit ?? 20,
    );
  }

  @Get('daily')
  getDailyLeaderboard(
    @Query()
    query: LeaderboardQueryDto,
  ) {
    return this.leaderboardService.getDailyLeaderboard(
      toPrismaSudokuVariant(query.variant),
      query.limit ?? 20,
    );
  }
}
