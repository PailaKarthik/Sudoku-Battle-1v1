import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { SudokuVariant } from '../generated/prisma/client.js';

@Injectable()
export class DailyService {
  constructor(private readonly prisma: PrismaService) {}

  async getToday(userId: string, variant: SudokuVariant) {
    const today = this.getTodayDate();

    let challenge = await this.prisma.dailyChallenge.findUnique({
      where: {
        challengeDate_variant: {
          challengeDate: today,
          variant,
        },
      },

      include: {
        puzzle: {
          select: {
            puzzleId: true,
            variant: true,
            puzzle: true,
            difficulty: true,
            difficultyScore: true,
            clueCount: true,
            estimatedSolveTime: true,
          },
        },

        attempts: {
          where: {
            userId,
          },

          select: {
            id: true,
            completionTimeMs: true,
            completedAt: true,
          },

          take: 1,
        },
      },
    });

    if (!challenge) {
      const puzzles = await this.prisma.sudokuPuzzle.findMany({
        where: {
          variant,
        },

        select: {
          id: true,
        },
      });

      if (!puzzles.length) {
        throw new NotFoundException('No Sudoku puzzles available');
      }

      const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

      challenge = await this.prisma.dailyChallenge.create({
        data: {
          challengeDate: today,
          variant,
          puzzleId: puzzle.id,
        },

        include: {
          puzzle: {
            select: {
              puzzleId: true,
              variant: true,
              puzzle: true,
              difficulty: true,
              difficultyScore: true,
              clueCount: true,
              estimatedSolveTime: true,
            },
          },

          attempts: {
            where: {
              userId,
            },

            select: {
              id: true,
              completionTimeMs: true,
              completedAt: true,
            },

            take: 1,
          },
        },
      });
    }

    const attempt = challenge.attempts[0] ?? null;

    return {
      id: challenge.id,

      challengeDate: challenge.challengeDate,

      variant: challenge.variant,

      puzzle: challenge.puzzle,

      completed: attempt !== null,

      attempt: attempt
        ? {
            completionTimeMs: attempt.completionTimeMs,

            completedAt: attempt.completedAt,
          }
        : null,
    };
  }

  async submitAttempt(
    userId: string,
    challengeId: string,
    completionTimeMs: number,
    board: number[][],
  ) {
    const challenge = await this.prisma.dailyChallenge.findUnique({
      where: {
        id: challengeId,
      },

      include: {
        puzzle: {
          select: {
            solution: true,
            variant: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Daily challenge not found');
    }

    const expectedSize =
      challenge.variant === SudokuVariant.TWO_BY_THREE ? 6 : 9;

    this.validateBoardShape(board, expectedSize);

    const solution = this.stringToGrid(challenge.puzzle.solution, expectedSize);

    if (!this.boardsMatch(board, solution)) {
      throw new ConflictException('Sudoku board is not solved correctly');
    }

    const existing = await this.prisma.dailyAttempt.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });

    if (existing) {
      if (completionTimeMs >= existing.completionTimeMs) {
        throw new ConflictException('Existing result is already faster');
      }

      return this.prisma.dailyAttempt.update({
        where: {
          id: existing.id,
        },

        data: {
          completionTimeMs,
          completedAt: new Date(),
        },
      });
    }

    try {
      return await this.prisma.dailyAttempt.create({
        data: {
          challengeId,
          userId,
          completionTimeMs,
        },
      });
    } catch (error) {
      /*
       * Another request may have created the
       * attempt between findUnique() and create().
       *
       * Re-read the existing result instead of
       * exposing a raw Prisma error.
       */
      const existingAttempt = await this.prisma.dailyAttempt.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
      });

      if (existingAttempt) {
        if (completionTimeMs < existingAttempt.completionTimeMs) {
          return this.prisma.dailyAttempt.update({
            where: {
              id: existingAttempt.id,
            },
            data: {
              completionTimeMs,
              completedAt: new Date(),
            },
          });
        }

        throw new ConflictException('Existing result is already faster');
      }

      throw error;
    }
  }

  async getLeaderboard(
    challengeId: string,
    userId: string,
    scope: 'global' | 'friends',
  ) {
    const challenge = await this.prisma.dailyChallenge.findUnique({
      where: {
        id: challengeId,
      },
    });

    if (!challenge) {
      throw new NotFoundException('Daily challenge not found');
    }

    let userIds: string[] | undefined;

    if (scope === 'friends') {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [{ userId }, { friendId: userId }],
        },

        select: {
          userId: true,
          friendId: true,
        },
      });

      const friendIds = friendships.flatMap((friendship) =>
        friendship.userId === userId
          ? [friendship.friendId]
          : [friendship.userId],
      );

      userIds = [userId, ...friendIds];
    }

    const attempts = await this.prisma.dailyAttempt.findMany({
      where: {
        challengeId,

        ...(userIds
          ? {
              userId: {
                in: userIds,
              },
            }
          : {}),
      },

      select: {
        userId: true,
        completionTimeMs: true,
        completedAt: true,

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
    });

    return attempts.map((attempt, index) => ({
      rank: index + 1,
      user: attempt.user,
      completionTimeMs: attempt.completionTimeMs,
      completedAt: attempt.completedAt,
      isCurrentUser: attempt.userId === userId,
    }));
  }

  private async getRandomPuzzle(variant: SudokuVariant) {
    const puzzles = await this.prisma.sudokuPuzzle.findMany({
      where: {
        variant,
      },

      select: {
        id: true,
      },
    });

    if (!puzzles.length) {
      throw new NotFoundException('No Sudoku puzzles available');
    }

    return puzzles[Math.floor(Math.random() * puzzles.length)];
  }

  private validateBoardShape(board: number[][], size: number): void {
    if (board.length !== size) {
      throw new ConflictException('Invalid Sudoku board size');
    }

    for (const row of board) {
      if (row.length !== size) {
        throw new ConflictException('Invalid Sudoku board size');
      }

      for (const value of row) {
        if (!Number.isInteger(value) || value < 1 || value > size) {
          throw new ConflictException('Invalid Sudoku board value');
        }
      }
    }
  }

  private stringToGrid(value: string, size: number): number[][] {
    if (value.length !== size * size) {
      throw new ConflictException('Stored Sudoku solution is invalid');
    }

    return Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, column) =>
        Number(value[row * size + column]),
      ),
    );
  }

  private boardsMatch(board: number[][], solution: number[][]): boolean {
    if (board.length !== solution.length) {
      return false;
    }

    for (let row = 0; row < solution.length; row += 1) {
      for (let column = 0; column < solution[row].length; column += 1) {
        if (board[row][column] !== solution[row][column]) {
          return false;
        }
      }
    }

    return true;
  }

  private getTodayDate(): Date {
    const now = new Date();

    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }
}
