import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { SudokuVariant } from '../generated/prisma/client.js';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getBattleLeaderboard(variant: SudokuVariant, limit = 20) {
    return this.prisma.rating.findMany({
      where: {
        variant,
      },

      select: {
        rating: true,
        gamesPlayed: true,
        wins: true,

        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },

      orderBy: {
        rating: 'desc',
      },

      take: limit,
    });
  }

  async getDailyLeaderboard(variant: SudokuVariant, limit = 20) {
    const today = new Date();

    const challenge = await this.prisma.dailyChallenge.findUnique({
      where: {
        challengeDate_variant: {
          challengeDate: new Date(
            Date.UTC(
              today.getUTCFullYear(),
              today.getUTCMonth(),
              today.getUTCDate(),
            ),
          ),
          variant,
        },
      },
    });

    if (!challenge) {
      return [];
    }

    return this.prisma.dailyAttempt.findMany({
      where: {
        challengeId: challenge.id,
      },

      select: {
        completionTimeMs: true,

        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },

      orderBy: {
        completionTimeMs: 'asc',
      },

      take: limit,
    });
  }
}
