import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';

import type { DefaultEventsMap, Namespace, Socket } from 'socket.io';

import { BattlePresenceService } from './battle-presence.service.js';

import { BattleStateService } from './battle-state.service.js';

import { BattlesService } from './battles.service.js';

import { MatchmakingService } from './matchmaking.service.js';

import { SudokuVariant } from '../generated/prisma/client.js';

type AccessTokenPayload = {
  sub: string;

  email: string;

  sessionId: string;

  iat?: number;

  exp?: number;
};

type BattleSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  {
    user?: AccessTokenPayload;
  }
>;

type BattleStartTimer = ReturnType<typeof setInterval>;

type MatchmakingVariant = '2x3' | '3x3';

function toPrismaVariant(variant: MatchmakingVariant): SudokuVariant {
  return variant === '2x3'
    ? SudokuVariant.TWO_BY_THREE
    : SudokuVariant.THREE_BY_THREE;
}

@WebSocketGateway({
  namespace: '/battle',

  transports: ['websocket'],

  cors: {
    origin: true,

    credentials: true,
  },
})
export class BattlesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Namespace;

  private readonly startTimers = new Map<string, BattleStartTimer>();

  constructor(
    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,

    private readonly presenceService: BattlePresenceService,

    private readonly battlesService: BattlesService,

    private readonly battleStateService: BattleStateService,

    private readonly matchmakingService: MatchmakingService,
  ) {}

  /*
   * =========================================================
   * GLOBAL USER NOTIFICATION
   * =========================================================
   */

  async notifyUser(
    userId: string,
    event: string,
    data: unknown,
  ): Promise<void> {
    const socketIds = await this.presenceService.getSocketIds(userId);

    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, data);
    }
  }

  /*
   * =========================================================
   * CONNECTION
   * =========================================================
   */

  async handleConnection(client: BattleSocket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        client.disconnect(true);

        return;
      }

      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        },
      );

      client.data.user = payload;

      await this.presenceService.addConnection(payload.sub, client.id);

      client.emit('connection.ready', {
        userId: payload.sub,
      });
    } catch {
      client.disconnect(true);
    }
  }

  /*
   * =========================================================
   * DISCONNECTION
   * =========================================================
   */

  async handleDisconnect(client: BattleSocket): Promise<void> {
    const userId = client.data.user?.sub;

    if (!userId) {
      return;
    }

    await this.presenceService.removeConnection(userId, client.id);

    /*
     * Only leave matchmaking if ALL sockets
     * belonging to this user are gone.
     */
    const stillOnline = await this.presenceService.isOnline(userId);

    if (!stillOnline) {
      await this.matchmakingService.leaveAllQueues(userId);
    }

    await this.cancelInvalidCountdowns();
  }

  /*
   * =========================================================
   * PING
   * =========================================================
   */

  @SubscribeMessage('ping')
  ping() {
    return {
      event: 'pong',

      data: {
        timestamp: Date.now(),
      },
    };
  }

  /*
   * =========================================================
   * PRESENCE
   * =========================================================
   */

  @SubscribeMessage('presence.check')
  async checkPresence(
    @MessageBody()
    data: {
      userId: string;
    },
  ) {
    if (!data?.userId) {
      throw new WsException('userId is required');
    }

    return {
      event: 'presence.status',

      data: {
        userId: data.userId,

        online: await this.presenceService.isOnline(data.userId),
      },
    };
  }

  /*
   * =========================================================
   * MATCHMAKING JOIN
   * =========================================================
   */

  @SubscribeMessage('matchmaking.join')
  async joinMatchmaking(
    @ConnectedSocket()
    client: BattleSocket,

    @MessageBody()
    data: {
      variant: MatchmakingVariant;
    },
  ): Promise<void> {
    const userId = client.data.user?.sub;

    if (!userId) {
      throw new WsException('Authentication required');
    }

    if (data?.variant !== '2x3' && data?.variant !== '3x3') {
      throw new WsException('Invalid Sudoku variant');
    }

    try {
      const result = await this.matchmakingService.joinQueue(
        userId,
        toPrismaVariant(data.variant),
      );

      /*
       * Still waiting.
       */
      if (!result.matched) {
        client.emit('matchmaking.queued', {
          variant: data.variant,

          positionApproximate: result.positionApproximate,
        });

        return;
      }

      /*
       * Match found.
       */
      const battle = await this.battlesService.getBattle(result.battleId);

      /*
       * Notify both players through ALL of
       * their active sockets.
       */
      for (const player of battle.players) {
        const opponentId =
          player.user.id === userId ? result.opponentId : userId;

        await this.notifyUser(player.user.id, 'matchmaking.matched', {
          battleId: result.battleId,

          variant: data.variant,

          opponentId,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Matchmaking failed';

      throw new WsException(message);
    }
  }

  /*
   * =========================================================
   * MATCHMAKING LEAVE
   * =========================================================
   */

  @SubscribeMessage('matchmaking.leave')
  async leaveMatchmaking(
    @ConnectedSocket()
    client: BattleSocket,

    @MessageBody()
    data: {
      variant: MatchmakingVariant;
    },
  ): Promise<void> {
    const userId = client.data.user?.sub;

    if (!userId) {
      throw new WsException('Authentication required');
    }

    if (data?.variant !== '2x3' && data?.variant !== '3x3') {
      throw new WsException('Invalid Sudoku variant');
    }

    try {
      await this.matchmakingService.leaveQueue(
        userId,
        toPrismaVariant(data.variant),
      );

      client.emit('matchmaking.cancelled', {
        variant: data.variant,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to cancel matchmaking';

      throw new WsException(message);
    }
  }

  /*
   * =========================================================
   * JOIN BATTLE
   * =========================================================
   */

  @SubscribeMessage('battle.join')
  async joinBattle(
    @ConnectedSocket()
    client: BattleSocket,

    @MessageBody()
    data: {
      battleId: string;
    },
  ): Promise<void> {
    if (!data?.battleId) {
      throw new WsException('battleId is required');
    }

    const userId = client.data.user?.sub;

    if (!userId) {
      throw new WsException('Authentication required');
    }

    const battle = await this.battlesService.getBattle(data.battleId);

    const isPlayer = battle.players.some((player) => player.user.id === userId);

    if (!isPlayer) {
      throw new WsException('You are not a player in this battle');
    }

    if (battle.status !== 'READY' && battle.status !== 'IN_PROGRESS') {
      throw new WsException('Battle is not available');
    }

    const room = `battle:${data.battleId}`;

    await client.join(room);
    console.log('[BATTLE WS] JOINED ROOM', {
      socketId: client.id,

      userId,

      battleId: data.battleId,

      room,
    });

    client.emit('battle.joined', {
      battleId: data.battleId,
    });

    this.server.to(room).emit('battle.player.joined', {
      battleId: data.battleId,

      userId,
    });

    /*
     * If the battle is already running,
     * send the current game state to this
     * socket immediately.
     *
     * This is important for reconnects.
     */
    if (battle.status === 'IN_PROGRESS') {
      const startedAt = battle.startedAt ?? new Date();

      client.emit('battle.started', {
        battleId: battle.id,

        variant: battle.variant,

        startedAt,

        puzzle: {
          puzzleId: battle.puzzle.puzzleId,

          variant: battle.puzzle.variant,

          puzzle: battle.puzzle.puzzle,

          difficulty: battle.puzzle.difficulty,

          difficultyScore: battle.puzzle.difficultyScore,

          clueCount: battle.puzzle.clueCount,

          estimatedSolveTime: battle.puzzle.estimatedSolveTime,
        },

        players: battle.players,
      });

      return;
    }

    /*
     * READY state:
     * check whether BOTH players are in the
     * same room.
     */
    const sockets = await this.server.in(room).fetchSockets();
    console.log('[BATTLE WS] ROOM MEMBERS', {
      battleId: data.battleId,

      room,

      socketIds: sockets.map((socket) => socket.id),

      userIds: sockets
        .map((socket) => (socket as unknown as BattleSocket).data.user?.sub)
        .filter((id): id is string => typeof id === 'string'),
    });

    const connectedUserIds = new Set(
      sockets
        .map((socket) => (socket as unknown as BattleSocket).data.user?.sub)
        .filter((id): id is string => typeof id === 'string'),
    );

    if (connectedUserIds.size !== battle.players.length) {
      return;
    }

    /*
     * Never create two countdowns for the
     * same battle.
     */
    if (this.startTimers.has(data.battleId)) {
      return;
    }

    this.startBattleCountdown(data.battleId, room);
  }

  /*
   * =========================================================
   * COUNTDOWN
   * =========================================================
   */

  private startBattleCountdown(battleId: string, room: string): void {
    if (this.startTimers.has(battleId)) {
      return;
    }

    let remainingSeconds = 5;

    this.server.to(room).emit('battle.countdown', {
      battleId,

      seconds: remainingSeconds,
    });

    const timer = setInterval(() => {
      void (async () => {
        /*
         * Ensure both players are still
         * connected before continuing.
         */
        const sockets = await this.server.in(room).fetchSockets();

        const connectedUserIds = new Set(
          sockets
            .map((socket) => (socket as unknown as BattleSocket).data.user?.sub)
            .filter((id): id is string => typeof id === 'string'),
        );

        if (connectedUserIds.size < 2) {
          clearInterval(timer);

          this.startTimers.delete(battleId);

          this.server.to(room).emit('battle.countdown.cancelled', {
            battleId,
            reason: 'A player disconnected',
          });

          return;
        }

        remainingSeconds -= 1;

        if (remainingSeconds > 0) {
          this.server.to(room).emit('battle.countdown', {
            battleId,

            seconds: remainingSeconds,
          });

          return;
        }

        clearInterval(timer);

        this.startTimers.delete(battleId);

        await this.startBattle(battleId, room);
      })();
    }, 1000);

    this.startTimers.set(battleId, timer);
  }

  /*
   * =========================================================
   * START BATTLE
   * =========================================================
   */

  private async startBattle(battleId: string, room: string): Promise<void> {
    try {
      const result = await this.battlesService.startBattle(battleId);

      /*
       * Already started elsewhere.
       */
      if (!result.started) {
        return;
      }

      const startedBattle = result.battle;

      await this.battleStateService.createGame({
        battleId: startedBattle.id,

        puzzleId: startedBattle.puzzle.puzzleId,

        variant: startedBattle.variant,

        puzzle: startedBattle.puzzle.puzzle,

        solution: startedBattle.puzzle.solution,

        playerIds: startedBattle.players.map((player) => player.userId),

        startedAt: startedBattle.startedAt ?? new Date(),
      });

      this.server.to(room).emit('battle.started', {
        battleId: startedBattle.id,

        variant: startedBattle.variant,

        startedAt: startedBattle.startedAt,

        puzzle: {
          puzzleId: startedBattle.puzzle.puzzleId,

          variant: startedBattle.puzzle.variant,

          puzzle: startedBattle.puzzle.puzzle,

          difficulty: startedBattle.puzzle.difficulty,

          difficultyScore: startedBattle.puzzle.difficultyScore,

          clueCount: startedBattle.puzzle.clueCount,

          estimatedSolveTime: startedBattle.puzzle.estimatedSolveTime,
        },

        players: startedBattle.players,
      });
    } catch (error) {
      console.error('[Battle] Start failed:', error);

      this.server.to(room).emit('battle.start.failed', {
        battleId,

        message:
          error instanceof Error ? error.message : 'Unable to start battle',
      });
    }
  }

  /*
   * =========================================================
   * MOVE
   * =========================================================
   */

  @SubscribeMessage('battle.move')
  async battleMove(
    @ConnectedSocket()
    client: BattleSocket,

    @MessageBody()
    data: {
      battleId: string;
      row: number;
      column: number;
      value: number;
    },
  ): Promise<void> {
    const userId = client.data.user?.sub;

    if (!userId) {
      throw new WsException('Authentication required');
    }

    if (!data?.battleId) {
      throw new WsException('battleId is required');
    }

    /*
     * Validate all primitives before
     * passing them into Redis state.
     */
    if (
      !Number.isInteger(data.row) ||
      !Number.isInteger(data.column) ||
      !Number.isInteger(data.value)
    ) {
      throw new WsException('Invalid move');
    }

    try {
      const result = await this.battleStateService.applyMove(
        data.battleId,
        userId,
        data.row,
        data.column,
        data.value,
      );

      if (!result.ok) {
        throw new WsException(result.reason);
      }

      /*
       * Incorrect move:
       * only the sender needs the rejection.
       */
      if (!result.correct) {
        client.emit('battle.move.result', {
          correct: false,

          row: data.row,

          column: data.column,

          value: data.value,
        });

        return;
      }

      const room = `battle:${data.battleId}`;

      /*
       * Correct moves are broadcast
       * immediately to both players.
       */
      this.server.to(room).emit('battle.move', {
        userId,

        row: result.row,

        column: result.column,

        value: result.value,
      });

      if (!result.completed) {
        return;
      }

      console.log('[BATTLE WS] SOLUTION COMPLETE', {
        battleId: data.battleId,

        userId,

        row: result.row,

        column: result.column,
      });

      const game = await this.battleStateService.getPlayerGame(
        data.battleId,
        userId,
      );

      const completionTimeMs = Date.now() - new Date(game.startedAt).getTime();

      try {
        const completedBattle = await this.battlesService.finishBattle(
          data.battleId,
          userId,
          completionTimeMs,
        );

        const room = `battle:${data.battleId}`;

        console.log('[BATTLE WS] FINISH BROADCAST', {
          battleId: data.battleId,

          winnerId: userId,

          room,
        });

        this.server.to(room).emit('battle.finished', {
          battleId: completedBattle.id,

          winnerId: userId,

          players: completedBattle.players,
        });

        const playerIds = completedBattle.players.map(
          (player) => player.userId,
        );

        await this.battleStateService.removeGame(data.battleId, playerIds);
      } catch (error) {
        /*
         * Another player already finalized the
         * battle. Do not emit another winner.
         */
        const message =
          error instanceof Error ? error.message : 'Battle finish failed';

        if (message === 'Battle has already finished') {
          console.log('[BATTLE WS] Duplicate finish ignored', {
            battleId: data.battleId,

            userId,
          });

          return;
        }

        console.error('[BATTLE WS] Finish failed', {
          battleId: data.battleId,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new WsException(message);
      }
    } catch (error) {
      /*
       * Don't leak raw backend errors.
       */
      const message =
        error instanceof WsException
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Battle move failed';

      throw new WsException(message);
    }
  }

  /*
   * =========================================================
   * COUNTDOWN CLEANUP
   * =========================================================
   */

  private async cancelInvalidCountdowns(): Promise<void> {
    for (const [battleId, timer] of this.startTimers) {
      const room = `battle:${battleId}`;

      const sockets = await this.server.in(room).fetchSockets();

      const connectedUserIds = new Set(
        sockets
          .map((socket) => (socket as unknown as BattleSocket).data.user?.sub)
          .filter((id): id is string => typeof id === 'string'),
      );

      if (connectedUserIds.size >= 2) {
        continue;
      }

      clearInterval(timer);

      this.startTimers.delete(battleId);

      this.server.to(room).emit('battle.countdown.cancelled', {
        battleId,

        reason: 'A player disconnected',
      });
    }
  }

  /*
   * =========================================================
   * TOKEN EXTRACTION
   * =========================================================
   */

  private extractToken(client: BattleSocket): string | undefined {
    const auth = client.handshake.auth as
      | {
          token?: unknown;
        }
      | undefined;

    const token = auth?.token;

    if (typeof token === 'string' && token.length > 0) {
      return token.startsWith('Bearer ') ? token.slice(7) : token;
    }

    const authorization = client.handshake.headers.authorization;

    if (typeof authorization === 'string') {
      const [type, value] = authorization.split(' ');

      if (type === 'Bearer' && value) {
        return value;
      }
    }

    return undefined;
  }
}
