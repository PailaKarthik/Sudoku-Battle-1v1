import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../prisma/prisma.service.js';

import {
  BattleStatus,
  BattleResult,
  SudokuVariant,
} from '../generated/prisma/client.js';

import { BattlePresenceService } from './battle-presence.service.js';

import { MatchmakingService } from './matchmaking.service.js';

const FRIEND_BATTLE_INVITE_TTL_MS = 10_000;

@Injectable()
export class BattlesService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly eventEmitter: EventEmitter2,

    private readonly presenceService: BattlePresenceService,

    private readonly matchmakingService: MatchmakingService,
  ) {}

  /*
   * =========================================================
   * FRIEND BATTLE INVITES
   * =========================================================
   */

  async sendInvite(
    senderId: string,
    receiverId: string,
    variant: SudokuVariant,
  ) {
    if (senderId === receiverId) {
      throw new ConflictException('You cannot challenge yourself');
    }

    /*
     * Sender cannot send a challenge while
     * already playing a battle.
     */
    const senderBattle = await this.findActiveBattleForUser(senderId);

    if (senderBattle) {
      throw new ConflictException('You are already in a battle');
    }

    /*
     * Sender cannot challenge while queued
     * for matchmaking.
     */
    const senderQueued = await this.matchmakingService.isQueued(
      senderId,
      variant,
    );

    if (senderQueued) {
      throw new ConflictException(
        'Leave matchmaking before challenging a friend',
      );
    }

    /*
     * Verify friendship.
     */
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            userId: senderId,
            friendId: receiverId,
          },
          {
            userId: receiverId,
            friendId: senderId,
          },
        ],
      },
    });

    if (!friendship) {
      throw new ConflictException('You can only challenge friends');
    }

    /*
     * Receiver must exist.
     */
    const receiver = await this.prisma.user.findUnique({
      where: {
        id: receiverId,
      },

      select: {
        id: true,
      },
    });

    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    /*
     * Receiver must currently have at least
     * one active socket connection.
     */
    const receiverOnline = await this.presenceService.isOnline(receiverId);

    if (!receiverOnline) {
      throw new ConflictException('This player is offline');
    }

    /*
     * Receiver must not already be playing.
     */
    const receiverBattle = await this.findActiveBattleForUser(receiverId);

    if (receiverBattle) {
      throw new ConflictException('This player is already in a battle');
    }

    /*
     * Receiver must not be searching for
     * another opponent.
     */
    const receiverQueued = await this.matchmakingService.isQueued(
      receiverId,
      variant,
    );

    if (receiverQueued) {
      throw new ConflictException(
        'This player is currently searching for an opponent',
      );
    }

    /*
     * Remove stale pending invites first.
     */
    await this.expireOldInvites(senderId, receiverId);

    /*
     * Prevent duplicate pending invite.
     */
    const existingPendingInvite = await this.prisma.battleInvite.findFirst({
      where: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    if (existingPendingInvite) {
      throw new ConflictException('Battle invite already sent');
    }

    const invite = await this.prisma.battleInvite.create({
      data: {
        senderId,
        receiverId,
        variant,
      },

      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const expiresAt = new Date(
      invite.createdAt.getTime() + FRIEND_BATTLE_INVITE_TTL_MS,
    );

    /*
     * Immediately notify receiver.
     */
    this.eventEmitter.emit('battle.invite.created', {
      inviteId: invite.id,

      receiverId: invite.receiverId,

      sender: invite.sender,

      variant: invite.variant,

      expiresAt: expiresAt.toISOString(),
    });

    /*
     * Schedule server-side expiration.
     *
     * This is useful locally and the timestamp
     * remains authoritative even if the process
     * restarts.
     */
    this.scheduleInviteExpiry(invite.id);

    return {
      ...invite,
      expiresAt,
    };
  }

  async getIncomingInvites(userId: string) {
    await this.expireUserPendingInvites(userId);

    return this.prisma.battleInvite.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },

      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async acceptInvite(userId: string, inviteId: string) {
    console.log('[BATTLE HTTP] ACCEPT START', {
      userId,
      inviteId,
    });

    try {
      const invite = await this.prisma.battleInvite.findUnique({
        where: {
          id: inviteId,
        },
      });

      if (!invite) {
        throw new NotFoundException('Battle invite not found');
      }

      if (invite.receiverId !== userId) {
        throw new ConflictException('You cannot accept this invitation');
      }

      if (invite.status !== 'PENDING') {
        throw new ConflictException(
          `Battle invite is already ${invite.status}`,
        );
      }

      const ageMs = Date.now() - invite.createdAt.getTime();

      console.log('[BATTLE HTTP] INVITE VALID', {
        inviteId,
        senderId: invite.senderId,
        receiverId: invite.receiverId,
        variant: invite.variant,
        ageMs,
      });

      if (ageMs >= 10_000) {
        const expired = await this.prisma.battleInvite.updateMany({
          where: {
            id: invite.id,
            status: 'PENDING',
          },

          data: {
            status: 'EXPIRED',
            respondedAt: new Date(),
          },
        });

        if (expired.count === 1) {
          this.eventEmitter.emit('battle.invite.updated', {
            inviteId: invite.id,

            senderId: invite.senderId,

            receiverId: invite.receiverId,

            status: 'EXPIRED',
          });
        }

        throw new ConflictException('Battle invite has expired');
      }

      const battle = await this.prisma.$transaction(async (tx) => {
        console.log('[BATTLE HTTP] TRANSACTION START', {
          inviteId,
        });

        const existingBattle = await tx.battle.findFirst({
          where: {
            status: {
              in: ['WAITING', 'READY', 'IN_PROGRESS'],
            },

            players: {
              some: {
                userId: {
                  in: [invite.senderId, invite.receiverId],
                },
              },
            },
          },

          select: {
            id: true,
          },
        });

        if (existingBattle) {
          throw new ConflictException(
            'A battle is already active for one of these players',
          );
        }

        const puzzles = await tx.sudokuPuzzle.findMany({
          where: {
            variant: invite.variant,
          },

          select: {
            id: true,
          },
        });

        console.log('[BATTLE HTTP] PUZZLES FOUND', {
          inviteId,
          count: puzzles.length,
        });

        if (puzzles.length === 0) {
          throw new NotFoundException(
            'No Sudoku puzzles available for this variant',
          );
        }

        const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

        /*
         * Get both current ratings.
         *
         * Your intended starting rating is 1000.
         */
        const [senderRating, receiverRating] = await Promise.all([
          tx.rating.findUnique({
            where: {
              userId_variant: {
                userId: invite.senderId,

                variant: invite.variant,
              },
            },

            select: {
              rating: true,
            },
          }),

          tx.rating.findUnique({
            where: {
              userId_variant: {
                userId: invite.receiverId,

                variant: invite.variant,
              },
            },

            select: {
              rating: true,
            },
          }),
        ]);

        const createdBattle = await tx.battle.create({
          data: {
            variant: invite.variant,

            puzzleId: puzzle.id,

            status: BattleStatus.READY,

            players: {
              create: [
                {
                  userId: invite.senderId,

                  slot: 1,

                  ratingBefore: senderRating?.rating ?? 1000,
                },

                {
                  userId: invite.receiverId,

                  slot: 2,

                  ratingBefore: receiverRating?.rating ?? 1000,
                },
              ],
            },
          },

          /*
           * VERY IMPORTANT:
           *
           * Do NOT return puzzle: true here.
           *
           * SudokuPuzzle contains BigInt seed.
           */
          select: {
            id: true,

            variant: true,

            status: true,

            puzzleId: true,

            createdAt: true,

            startedAt: true,

            finishedAt: true,

            players: {
              select: {
                userId: true,

                slot: true,

                result: true,

                completionTimeMs: true,

                ratingBefore: true,

                ratingChange: true,

                ratingAfter: true,
              },
            },
          },
        });

        console.log('[BATTLE HTTP] BATTLE CREATED', {
          battleId: createdBattle.id,

          players: createdBattle.players.map((player) => player.userId),
        });

        const updatedInvite = await tx.battleInvite.updateMany({
          where: {
            id: invite.id,

            status: 'PENDING',
          },

          data: {
            status: 'ACCEPTED',

            respondedAt: new Date(),
          },
        });

        if (updatedInvite.count !== 1) {
          throw new ConflictException('Battle invite could not be accepted');
        }

        console.log('[BATTLE HTTP] INVITE ACCEPTED', {
          inviteId: invite.id,

          battleId: createdBattle.id,
        });

        return createdBattle;
      });

      /*
       * THIS EVENT NAME MUST MATCH BattlesEvents.
       */
      this.eventEmitter.emit('battle.invite.updated', {
        inviteId: invite.id,

        senderId: invite.senderId,

        receiverId: invite.receiverId,

        status: 'ACCEPTED',

        battleId: battle.id,
      });

      console.log('[BATTLE HTTP] ACCEPT COMPLETE', {
        inviteId: invite.id,

        battleId: battle.id,
      });

      /*
       * Return only JSON-safe fields.
       */
      return battle;
    } catch (error) {
      console.error('[BATTLE HTTP] ACCEPT FAILED', {
        userId,
        inviteId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  async declineInvite(userId: string, inviteId: string) {
    const invite = await this.prisma.battleInvite.findUnique({
      where: {
        id: inviteId,
      },
    });

    if (!invite || invite.receiverId !== userId) {
      throw new NotFoundException('Battle invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new ConflictException('Battle invite is no longer available');
    }

    const ageMs = Date.now() - invite.createdAt.getTime();

    if (ageMs >= 10_000) {
      const expired = await this.prisma.battleInvite.updateMany({
        where: {
          id: invite.id,
          status: 'PENDING',
        },
        data: {
          status: 'EXPIRED',
          respondedAt: new Date(),
        },
      });

      if (expired.count === 1) {
        this.eventEmitter.emit('battle.invite.updated', {
          inviteId: invite.id,
          senderId: invite.senderId,
          receiverId: invite.receiverId,
          status: 'EXPIRED',
        });
      }

      throw new ConflictException('Battle invite has expired');
    }

    const updated = await this.prisma.battleInvite.updateMany({
      where: {
        id: invite.id,
        receiverId: userId,
        status: 'PENDING',
      },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      throw new ConflictException('Battle invite is no longer available');
    }

    this.eventEmitter.emit('battle.invite.updated', {
      inviteId: invite.id,
      senderId: invite.senderId,
      receiverId: invite.receiverId,
      status: 'DECLINED',
    });

    return this.prisma.battleInvite.findUniqueOrThrow({
      where: {
        id: invite.id,
      },
    });
  }

  /*
   * =========================================================
   * NORMAL BATTLE CREATION
   * =========================================================
   */

  async createBattle(userId: string, variant: SudokuVariant) {
    const puzzle = await this.getRandomPuzzle(variant);

    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_variant: {
          userId,
          variant,
        },
      },
    });

    return this.prisma.battle.create({
      data: {
        variant,

        puzzleId: puzzle.id,

        status: BattleStatus.WAITING,

        players: {
          create: {
            userId,

            slot: 1,

            ratingBefore: rating?.rating ?? 1000,
          },
        },
      },

      include: {
        puzzle: true,

        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /*
   * =========================================================
   * BATTLE FETCH
   * =========================================================
   */

  async getBattle(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: {
        id: battleId,
      },

      select: {
        id: true,

        variant: true,

        puzzleId: true,

        status: true,

        createdAt: true,

        startedAt: true,

        finishedAt: true,

        puzzle: {
          select: {
            puzzleId: true,

            variant: true,

            puzzle: true,

            solution: true,

            difficulty: true,

            difficultyScore: true,

            clueCount: true,

            estimatedSolveTime: true,

            /*
             * seed is deliberately omitted.
             */
          },
        },

        players: {
          select: {
            userId: true,

            slot: true,

            result: true,

            completionTimeMs: true,

            ratingBefore: true,

            ratingChange: true,

            ratingAfter: true,

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
        },
      },
    });

    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    return battle;
  }

  /*
   * =========================================================
   * BATTLE START
   * =========================================================
   */

  async startBattle(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: {
        id: battleId,
      },

      include: {
        puzzle: true,

        players: true,
      },
    });

    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    if (battle.status === BattleStatus.IN_PROGRESS) {
      const current = await this.getBattle(battleId);

      return {
        started: false,

        battle: current,
      };
    }

    if (battle.status !== BattleStatus.READY) {
      throw new ConflictException('Battle is not ready');
    }

    if (battle.players.length !== 2) {
      throw new ConflictException('Battle requires two players');
    }

    const startedAt = new Date();

    const updated = await this.prisma.battle.update({
      where: {
        id: battleId,
      },

      data: {
        status: BattleStatus.IN_PROGRESS,

        startedAt,
      },
    });

    const complete = await this.getBattle(updated.id);

    return {
      started: true,

      battle: complete,
    };
  }

  /*
   * =========================================================
   * BATTLE FINISH
   * =========================================================
   */

  async finishBattle(
    battleId: string,
    winnerId: string,
    completionTimeMs: number,
  ) {
    if (!Number.isInteger(completionTimeMs) || completionTimeMs <= 0) {
      throw new ConflictException('Invalid completion time');
    }

    console.log('[BATTLE FINISH] START', {
      battleId,
      winnerId,
      completionTimeMs,
    });

    /*
     * ---------------------------------------------------------
     * 1. READ THE BATTLE BEFORE STARTING THE TRANSACTION
     * ---------------------------------------------------------
     */
    const battle = await this.prisma.battle.findUnique({
      where: {
        id: battleId,
      },

      include: {
        players: true,
      },
    });

    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    console.log('[BATTLE FINISH] BATTLE LOADED', {
      battleId,
      status: battle.status,
      playerCount: battle.players.length,
      startedAt: battle.startedAt,
    });

    if (battle.status !== BattleStatus.IN_PROGRESS) {
      throw new ConflictException('Battle has already finished');
    }

    const winner = battle.players.find((player) => player.userId === winnerId);

    if (!winner) {
      throw new ConflictException('Winner is not a battle player');
    }

    const loser = battle.players.find((player) => player.userId !== winnerId);

    if (!loser) {
      throw new ConflictException('Battle opponent not found');
    }

    /*
     * ---------------------------------------------------------
     * 2. READ CURRENT RATINGS BEFORE TRANSACTION
     * ---------------------------------------------------------
     */
    const [winnerRating, loserRating] = await Promise.all([
      this.prisma.rating.findUnique({
        where: {
          userId_variant: {
            userId: winner.userId,

            variant: battle.variant,
          },
        },

        select: {
          rating: true,
          highestRating: true,
        },
      }),

      this.prisma.rating.findUnique({
        where: {
          userId_variant: {
            userId: loser.userId,

            variant: battle.variant,
          },
        },

        select: {
          rating: true,
          highestRating: true,
        },
      }),
    ]);

    const winnerBefore = winnerRating?.rating ?? 1000;

    const loserBefore = loserRating?.rating ?? 1000;

    const winnerChange = this.calculateRatingChange(
      winnerBefore,
      loserBefore,
      true,
    );

    const loserChange = this.calculateRatingChange(
      loserBefore,
      winnerBefore,
      false,
    );

    const winnerAfter = winnerBefore + winnerChange;

    const loserAfter = Math.max(0, loserBefore + loserChange);

    /*
     * The server's battle duration.
     */
    const finishedAt = new Date();

    const battleDurationMs = battle.startedAt
      ? Math.max(1, finishedAt.getTime() - battle.startedAt.getTime())
      : completionTimeMs;

    const winnerTimeMs = Math.max(
      1,
      Math.min(completionTimeMs, battleDurationMs),
    );

    /*
     * The loser never solved the puzzle.
     * Store the time at which the battle ended.
     */
    const loserTimeMs = battleDurationMs;

    console.log('[BATTLE FINISH] VALUES READY', {
      battleId,
      winnerId,

      winnerBefore,
      winnerChange,
      winnerAfter,

      loserBefore,
      loserChange,
      loserAfter,

      winnerTimeMs,
      loserTimeMs,
    });

    /*
     * ---------------------------------------------------------
     * 3. SHORT TRANSACTION
     * ---------------------------------------------------------
     *
     * maxWait:
     * how long Prisma waits for a connection.
     *
     * timeout:
     * maximum interactive transaction duration.
     */
    const result = await this.prisma.$transaction(
      async (tx) => {
        console.log('[BATTLE FINISH] TRANSACTION START', {
          battleId,
        });

        /*
         * ---------------------------------------------------
         * ATOMIC CLAIM
         *
         * Only the first request can change:
         *
         * IN_PROGRESS -> COMPLETED
         * ---------------------------------------------------
         */
        const claimed = await tx.battle.updateMany({
          where: {
            id: battleId,

            status: BattleStatus.IN_PROGRESS,
          },

          data: {
            status: BattleStatus.COMPLETED,

            finishedAt,
          },
        });

        console.log('[BATTLE FINISH] CLAIM RESULT', {
          battleId,
          count: claimed.count,
        });

        /*
         * Another player already finished it.
         */
        if (claimed.count !== 1) {
          throw new ConflictException('Battle has already finished');
        }

        /*
         * ---------------------------------------------------
         * WINNER RATING
         * ---------------------------------------------------
         */
        await tx.rating.upsert({
          where: {
            userId_variant: {
              userId: winner.userId,

              variant: battle.variant,
            },
          },

          create: {
            userId: winner.userId,

            variant: battle.variant,

            rating: winnerAfter,

            gamesPlayed: 1,

            wins: 1,

            losses: 0,

            draws: 0,

            highestRating: Math.max(1000, winnerAfter),
          },

          update: {
            rating: winnerAfter,

            gamesPlayed: {
              increment: 1,
            },

            wins: {
              increment: 1,
            },

            highestRating: Math.max(
              winnerAfter,
              winnerRating?.highestRating ?? 1000,
            ),
          },
        });

        /*
         * ---------------------------------------------------
         * LOSER RATING
         * ---------------------------------------------------
         */
        await tx.rating.upsert({
          where: {
            userId_variant: {
              userId: loser.userId,

              variant: battle.variant,
            },
          },

          create: {
            userId: loser.userId,

            variant: battle.variant,

            rating: loserAfter,

            gamesPlayed: 1,

            wins: 0,

            losses: 1,

            draws: 0,

            highestRating: 1000,
          },

          update: {
            rating: loserAfter,

            gamesPlayed: {
              increment: 1,
            },

            losses: {
              increment: 1,
            },
          },
        });

        /*
         * ---------------------------------------------------
         * WINNER PLAYER
         * ---------------------------------------------------
         */
        await tx.battlePlayer.update({
          where: {
            id: winner.id,
          },

          data: {
            result: BattleResult.WIN,

            completionTimeMs: winnerTimeMs,

            ratingBefore: winnerBefore,

            ratingChange: winnerChange,

            ratingAfter: winnerAfter,

            completedAt: finishedAt,
          },
        });

        /*
         * ---------------------------------------------------
         * LOSER PLAYER
         * ---------------------------------------------------
         */
        await tx.battlePlayer.update({
          where: {
            id: loser.id,
          },

          data: {
            result: BattleResult.LOSS,

            completionTimeMs: loserTimeMs,

            ratingBefore: loserBefore,

            ratingChange: loserChange,

            ratingAfter: loserAfter,

            completedAt: finishedAt,
          },
        });

        console.log('[BATTLE FINISH] TRANSACTION UPDATES COMPLETE', {
          battleId,
        });

        return {
          battleId,
          winnerId,

          winnerTimeMs,

          loserTimeMs,

          finishedAt: finishedAt.toISOString(),
        };
      },
      {
        maxWait: 10_000,
        timeout: 15_000,
      },
    );

    console.log('[BATTLE FINISH] TRANSACTION COMPLETE', result);

    /*
     * Notify both players AFTER the DB transaction
     * has successfully committed.
     */
    this.eventEmitter.emit('battle.finished', result);

    console.log('[BATTLE FINISH] EVENT EMITTED', {
      battleId,
      winnerId,
    });

    return this.getBattle(battleId);
  }

  /*
   * =========================================================
   * CANCEL
   * =========================================================
   */

  async cancelBattle(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: {
        id: battleId,
      },
    });

    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    if (
      battle.status === BattleStatus.COMPLETED ||
      battle.status === BattleStatus.CANCELLED
    ) {
      return battle;
    }

    return this.prisma.battle.update({
      where: {
        id: battleId,
      },

      data: {
        status: BattleStatus.CANCELLED,
      },
    });
  }

  async getResult(battleId: string) {
    return this.getBattle(battleId);
  }

  async getRecentBattles(userId: string) {
    const battles = await this.prisma.battle.findMany({
      where: {
        status: BattleStatus.COMPLETED,

        players: {
          some: {
            userId,
          },
        },
      },

      orderBy: {
        finishedAt: 'desc',
      },

      take: 5,

      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return battles
      .map((battle) => {
        const me = battle.players.find((player) => player.userId === userId);

        if (!me) {
          return null;
        }

        const opponent = battle.players.find(
          (player) => player.userId !== userId,
        );

        return {
          id: battle.id,

          variant:
            battle.variant === SudokuVariant.TWO_BY_THREE ? '2×3' : '3×3',

          result:
            me.result === BattleResult.WIN
              ? 'win'
              : me.result === BattleResult.LOSS
                ? 'loss'
                : 'draw',

          opponent: opponent
            ? {
                id: opponent.user.id,
                username: opponent.user.username,
                displayName: opponent.user.displayName,
                avatarUrl: opponent.user.avatarUrl,
              }
            : null,

          completionTimeMs: me.completionTimeMs,

          ratingChange: me.ratingChange,

          ratingAfter: me.ratingAfter,

          finishedAt: battle.finishedAt,
        };
      })
      .filter((battle) => battle !== null);
  }

  /*
   * =========================================================
   * PRIVATE HELPERS
   * =========================================================
   */

  private async findActiveBattleForUser(userId: string) {
    return this.prisma.battle.findFirst({
      where: {
        status: {
          in: [
            BattleStatus.WAITING,
            BattleStatus.READY,
            BattleStatus.IN_PROGRESS,
          ],
        },

        players: {
          some: {
            userId,
          },
        },
      },

      select: {
        id: true,

        status: true,
      },
    });
  }

  private isInviteExpired(createdAt: Date): boolean {
    return Date.now() - createdAt.getTime() >= FRIEND_BATTLE_INVITE_TTL_MS;
  }

  private async expireOldInvites(senderId: string, receiverId: string) {
    const cutoff = new Date(Date.now() - FRIEND_BATTLE_INVITE_TTL_MS);

    const expired = await this.prisma.battleInvite.updateMany({
      where: {
        senderId,
        receiverId,
        status: 'PENDING',

        createdAt: {
          lte: cutoff,
        },
      },

      data: {
        status: 'EXPIRED',

        respondedAt: new Date(),
      },
    });

    if (expired.count === 0) {
      return;
    }

    const staleInvite = await this.prisma.battleInvite.findFirst({
      where: {
        senderId,
        receiverId,
        status: 'EXPIRED',
      },

      orderBy: {
        respondedAt: 'desc',
      },

      select: {
        id: true,
        senderId: true,
      },
    });

    if (staleInvite) {
      this.eventEmitter.emit('battle.invite.updated', {
        inviteId: staleInvite.id,

        senderId: staleInvite.senderId,

        status: 'EXPIRED',
      });
    }
  }

  private async expireUserPendingInvites(userId: string) {
    const cutoff = new Date(Date.now() - FRIEND_BATTLE_INVITE_TTL_MS);

    const expired = await this.prisma.battleInvite.updateMany({
      where: {
        receiverId: userId,

        status: 'PENDING',

        createdAt: {
          lte: cutoff,
        },
      },

      data: {
        status: 'EXPIRED',

        respondedAt: new Date(),
      },
    });

    if (expired.count === 0) {
      return;
    }
  }

  private scheduleInviteExpiry(inviteId: string): void {
    setTimeout(() => {
      void this.expireInvite(inviteId);
    }, FRIEND_BATTLE_INVITE_TTL_MS + 50);
  }

  private async expireInvite(inviteId: string): Promise<void> {
    try {
      const invite = await this.prisma.battleInvite.findUnique({
        where: {
          id: inviteId,
        },
      });

      if (!invite || invite.status !== 'PENDING') {
        return;
      }

      /*
       * Extra timestamp verification.
       */
      if (!this.isInviteExpired(invite.createdAt)) {
        this.scheduleInviteExpiry(invite.id);

        return;
      }

      const updated = await this.prisma.battleInvite.updateMany({
        where: {
          id: invite.id,
          status: 'PENDING',
        },

        data: {
          status: 'EXPIRED',

          respondedAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        return;
      }

      this.eventEmitter.emit('battle.invite.updated', {
        inviteId: invite.id,

        senderId: invite.senderId,

        status: 'EXPIRED',
      });
    } catch (error) {
      console.error('[Battle Invite] Expiry failed:', error);
    }
  }

  private calculateRatingChange(
    playerRating: number,
    opponentRating: number,
    playerWon: boolean,
  ): number {
    const expected =
      1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));

    const actual = playerWon ? 1 : 0;

    const K = 32;

    return Math.round(K * (actual - expected));
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
}
