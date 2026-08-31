import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { RedisService } from '../redis/redis.service.js';

import { SudokuVariant } from '../generated/prisma/client.js';

import { BattlePresenceService } from './battle-presence.service.js';

type MatchmakingTicket = {
  userId: string;
  variant: SudokuVariant;
  rating: number;
  joinedAt: number;
};

type MatchResult = {
  matched: true;
  opponentId: string;
  battleId: string;
};

type QueueResult = {
  matched: false;
  positionApproximate: number;
};

@Injectable()
export class MatchmakingService {
  private readonly queuePrefix = 'matchmaking:queue:';

  private readonly ticketPrefix = 'matchmaking:ticket:';

  private readonly lockPrefix = 'matchmaking:lock:';

  private readonly ticketTtlSeconds = 300;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly presenceService: BattlePresenceService,
  ) {}

  async joinQueue(
    userId: string,
    variant: SudokuVariant,
  ): Promise<MatchResult | QueueResult> {
    const existingBattle = await this.prisma.battle.findFirst({
      where: {
        status: {
          in: ['WAITING', 'READY', 'IN_PROGRESS'],
        },

        players: {
          some: {
            userId,
          },
        },
      },

      select: {
        id: true,
      },
    });

    if (existingBattle) {
      throw new ConflictException('You are already in a battle');
    }

    const online = await this.presenceService.isOnline(userId);

    if (!online) {
      throw new ConflictException('You are not connected');
    }

    const rating = await this.getRating(userId, variant);

    const queueKey = this.getQueueKey(variant);

    const ticketKey = this.getTicketKey(variant, userId);

    const redis = this.redisService.getClient();

    const existingTicket = await redis.get(ticketKey);

    if (existingTicket) {
      const existingScore = await redis.zScore(queueKey, userId);

      if (existingScore !== null) {
        throw new ConflictException('You are already in matchmaking');
      }

      await redis.del(ticketKey);
    }

    const ticket: MatchmakingTicket = {
      userId,

      variant,

      rating,

      joinedAt: Date.now(),
    };

    await redis.zAdd(queueKey, {
      score: rating,

      value: userId,
    });

    await this.redisService.setWithExpiry(
      ticketKey,

      JSON.stringify(ticket),

      this.ticketTtlSeconds,
    );

    return this.tryMatch(ticket);
  }

  async leaveQueue(userId: string, variant: SudokuVariant): Promise<void> {
    const redis = this.redisService.getClient();

    await Promise.all([
      redis.zRem(this.getQueueKey(variant), userId),

      redis.del(this.getTicketKey(variant, userId)),
    ]);
  }

  async leaveAllQueues(userId: string): Promise<void> {
    await Promise.all([
      this.leaveQueue(userId, SudokuVariant.TWO_BY_THREE),

      this.leaveQueue(userId, SudokuVariant.THREE_BY_THREE),
    ]);
  }

  async isQueued(userId: string, variant: SudokuVariant): Promise<boolean> {
    const redis = this.redisService.getClient();

    const queueKey = this.getQueueKey(variant);

    const ticketKey = this.getTicketKey(variant, userId);

    const [ticket, score] = await Promise.all([
      redis.get(ticketKey),

      redis.zScore(queueKey, userId),
    ]);

    if (ticket === null || score === null) {
      if (ticket !== null) {
        await redis.del(ticketKey);
      }

      if (score !== null) {
        await redis.zRem(queueKey, userId);
      }

      return false;
    }

    return true;
  }

  private async tryMatch(
    ticket: MatchmakingTicket,
  ): Promise<MatchResult | QueueResult> {
    const redis = this.redisService.getClient();

    const lockKey = this.getLockKey(ticket.variant);

    const lockToken = `${ticket.userId}:${Date.now()}:${Math.random()}`;

    const acquired = await redis.set(lockKey, lockToken, {
      NX: true,
      EX: 10,
    });

    if (!acquired) {
      return {
        matched: false,

        positionApproximate: await this.getQueueSize(ticket.variant),
      };
    }

    try {
      if (!(await this.isQueued(ticket.userId, ticket.variant))) {
        return {
          matched: false,

          positionApproximate: await this.getQueueSize(ticket.variant),
        };
      }

      const candidate = await this.findCandidate(ticket);

      if (!candidate) {
        return {
          matched: false,

          positionApproximate: await this.getQueueSize(ticket.variant),
        };
      }

      /*
       * Create the battle BEFORE deleting the
       * Redis tickets.
       */
      const battle = await this.createMatchedBattle(ticket, candidate);

      await Promise.all([
        this.removeTicket(ticket),

        this.removeTicket(candidate),
      ]);

      return {
        matched: true,

        opponentId: candidate.userId,

        battleId: battle.id,
      };
    } finally {
      const owner = await redis.get(lockKey);

      if (owner === lockToken) {
        await redis.del(lockKey);
      }
    }
  }

  private async findCandidate(
    ticket: MatchmakingTicket,
  ): Promise<MatchmakingTicket | null> {
    const redis = this.redisService.getClient();

    const queueKey = this.getQueueKey(ticket.variant);

    const waitedSeconds = Math.floor((Date.now() - ticket.joinedAt) / 1000);

    const maxRatingGap = Math.min(
      400,

      50 + Math.floor(waitedSeconds / 10) * 50,
    );

    const minimum = ticket.rating - maxRatingGap;

    const maximum = ticket.rating + maxRatingGap;

    const candidates = await redis.zRangeByScore(queueKey, minimum, maximum);

    let best: MatchmakingTicket | null = null;

    let bestScore = Number.POSITIVE_INFINITY;

    for (const candidateUserId of candidates) {
      if (candidateUserId === ticket.userId) {
        continue;
      }

      const raw = await redis.get(
        this.getTicketKey(ticket.variant, candidateUserId),
      );

      if (!raw) {
        await redis.zRem(queueKey, candidateUserId);

        continue;
      }

      let candidate: MatchmakingTicket;

      try {
        candidate = JSON.parse(raw) as MatchmakingTicket;
      } catch {
        await Promise.all([
          redis.zRem(queueKey, candidateUserId),

          redis.del(this.getTicketKey(ticket.variant, candidateUserId)),
        ]);

        continue;
      }

      if (candidate.userId !== candidateUserId) {
        await this.removeTicket(candidate);

        continue;
      }

      if (candidate.variant !== ticket.variant) {
        continue;
      }

      const online = await this.presenceService.isOnline(candidate.userId);

      if (!online) {
        await this.removeTicket(candidate);

        continue;
      }

      const activeBattle = await this.prisma.battle.findFirst({
        where: {
          status: {
            in: ['WAITING', 'READY', 'IN_PROGRESS'],
          },

          players: {
            some: {
              userId: candidate.userId,
            },
          },
        },

        select: {
          id: true,
        },
      });

      if (activeBattle) {
        await this.removeTicket(candidate);

        continue;
      }

      const candidateWaitSeconds = Math.floor(
        (Date.now() - candidate.joinedAt) / 1000,
      );

      const candidateAllowedGap = Math.min(
        400,

        50 + Math.floor(candidateWaitSeconds / 10) * 50,
      );

      const ratingDifference = Math.abs(ticket.rating - candidate.rating);

      if (ratingDifference > candidateAllowedGap) {
        continue;
      }

      const score = ratingDifference - Math.min(candidateWaitSeconds, 60);

      if (score < bestScore) {
        bestScore = score;

        best = candidate;
      }
    }

    return best;
  }

  private async removeTicket(ticket: MatchmakingTicket): Promise<void> {
    const redis = this.redisService.getClient();

    await Promise.all([
      redis.zRem(this.getQueueKey(ticket.variant), ticket.userId),

      redis.del(this.getTicketKey(ticket.variant, ticket.userId)),
    ]);
  }

  private async getRating(
    userId: string,
    variant: SudokuVariant,
  ): Promise<number> {
    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_variant: {
          userId,
          variant,
        },
      },

      select: {
        rating: true,
      },
    });

    return rating?.rating ?? 1000;
  }

  private async getQueueSize(variant: SudokuVariant): Promise<number> {
    const redis = this.redisService.getClient();

    return redis.zCard(this.getQueueKey(variant));
  }

  private getQueueKey(variant: SudokuVariant): string {
    return `${this.queuePrefix}${variant}`;
  }

  private getTicketKey(variant: SudokuVariant, userId: string): string {
    return `${this.ticketPrefix}${variant}:${userId}`;
  }

  private getLockKey(variant: SudokuVariant): string {
    return `${this.lockPrefix}${variant}`;
  }

  private async createMatchedBattle(
    first: MatchmakingTicket,
    second: MatchmakingTicket,
  ) {
    const puzzle = await this.prisma.sudokuPuzzle.findFirst({
      where: {
        variant: first.variant,
      },

      select: {
        id: true,
      },
    });

    if (!puzzle) {
      throw new NotFoundException('No Sudoku puzzles available');
    }

    const activeBattle = await this.prisma.battle.findFirst({
      where: {
        status: {
          in: ['WAITING', 'READY', 'IN_PROGRESS'],
        },

        players: {
          some: {
            userId: {
              in: [first.userId, second.userId],
            },
          },
        },
      },

      select: {
        id: true,
      },
    });

    if (activeBattle) {
      throw new ConflictException('A player is already in a battle');
    }

    return this.prisma.battle.create({
      data: {
        variant: first.variant,

        puzzleId: puzzle.id,

        status: 'READY',

        players: {
          create: [
            {
              userId: first.userId,

              slot: 1,

              ratingBefore: first.rating,
            },

            {
              userId: second.userId,

              slot: 2,

              ratingBefore: second.rating,
            },
          ],
        },
      },

      select: {
        id: true,

        variant: true,

        status: true,

        players: {
          select: {
            userId: true,
            slot: true,
          },
        },
      },
    });
  }
}
