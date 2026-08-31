import { Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '../redis/redis.service.js';

import { SudokuVariant } from '../generated/prisma/client.js';

type BattlePlayerState = {
  battleId: string;
  userId: string;
  puzzleId: string;
  variant: SudokuVariant;
  puzzle: string;
  solution: string;
  board: string;
  startedAt: string;
  finished: boolean;
};

type ApplyMoveResult =
  | {
      ok: false;
      reason: string;
    }
  | {
      ok: true;
      correct: false;
      completed: false;
      row: number;
      column: number;
      value: number;
    }
  | {
      ok: true;
      correct: true;
      completed: boolean;
      row: number;
      column: number;
      value: number;
    };

@Injectable()
export class BattleStateService {
  private readonly keyPrefix = 'battle:state:';

  private readonly stateTtlSeconds = 60 * 60 * 2;

  constructor(private readonly redisService: RedisService) {}

  private getPlayerKey(battleId: string, userId: string): string {
    return `${this.keyPrefix}${battleId}:player:${userId}`;
  }

  async createGame(data: {
    battleId: string;
    puzzleId: string;
    variant: SudokuVariant;
    puzzle: string;
    solution: string;
    playerIds: string[];
    startedAt: Date;
  }): Promise<void> {
    if (data.playerIds.length !== 2) {
      throw new Error('A battle must contain exactly two players');
    }

    if (data.puzzle.length !== data.solution.length) {
      throw new Error('Invalid Sudoku puzzle state');
    }

    const expectedSize = data.variant === SudokuVariant.TWO_BY_THREE ? 6 : 9;

    const expectedLength = expectedSize * expectedSize;

    if (
      data.puzzle.length !== expectedLength ||
      data.solution.length !== expectedLength
    ) {
      throw new Error('Invalid Sudoku puzzle dimensions');
    }

    const startedAt = data.startedAt.toISOString();

    await Promise.all(
      data.playerIds.map(async (userId) => {
        const state: BattlePlayerState = {
          battleId: data.battleId,

          userId,

          puzzleId: data.puzzleId,

          variant: data.variant,

          puzzle: data.puzzle,

          solution: data.solution,

          /*
           * Each player gets their own
           * independent solving board.
           */
          board: data.puzzle,

          startedAt,

          finished: false,
        };

        await this.redisService.setWithExpiry(
          this.getPlayerKey(data.battleId, userId),
          JSON.stringify(state),
          this.stateTtlSeconds,
        );
      }),
    );
  }

  async getPlayerGame(
    battleId: string,
    userId: string,
  ): Promise<BattlePlayerState> {
    const raw = await this.redisService.get(
      this.getPlayerKey(battleId, userId),
    );

    if (!raw) {
      throw new NotFoundException('Battle game state not found');
    }

    let state: BattlePlayerState;

    try {
      state = JSON.parse(raw) as BattlePlayerState;
    } catch {
      throw new NotFoundException('Battle game state is invalid');
    }

    if (state.battleId !== battleId || state.userId !== userId) {
      throw new NotFoundException('Battle game state is invalid');
    }

    return state;
  }

  async applyMove(
    battleId: string,
    userId: string,
    row: number,
    column: number,
    value: number,
  ): Promise<ApplyMoveResult> {
    const state = await this.getPlayerGame(battleId, userId);

    if (state.finished) {
      return {
        ok: false,
        reason: 'Battle is already finished',
      };
    }

    const size = state.variant === SudokuVariant.TWO_BY_THREE ? 6 : 9;

    /*
     * Validate move primitives.
     */
    if (
      !Number.isInteger(row) ||
      !Number.isInteger(column) ||
      !Number.isInteger(value)
    ) {
      return {
        ok: false,
        reason: 'Invalid move',
      };
    }

    if (row < 0 || row >= size || column < 0 || column >= size) {
      return {
        ok: false,
        reason: 'Invalid cell',
      };
    }

    if (value < 1 || value > size) {
      return {
        ok: false,
        reason: 'Invalid value',
      };
    }

    /*
     * Defensive validation of stored state.
     */
    const expectedLength = size * size;

    if (
      state.puzzle.length !== expectedLength ||
      state.solution.length !== expectedLength ||
      state.board.length !== expectedLength
    ) {
      return {
        ok: false,
        reason: 'Invalid battle state',
      };
    }

    const index = row * size + column;

    /*
     * Original puzzle uses '.'
     * for editable cells.
     */
    if (state.puzzle[index] !== '.') {
      return {
        ok: false,
        reason: 'Cell is fixed',
      };
    }

    /*
     * Validate against the server-side
     * solution.
     */
    const expected = Number(state.solution[index]);

    if (!Number.isInteger(expected) || expected < 1 || expected > size) {
      return {
        ok: false,
        reason: 'Invalid Sudoku solution',
      };
    }

    /*
     * Wrong number.
     *
     * Do NOT mutate the stored board.
     */
    if (value !== expected) {
      return {
        ok: true,
        correct: false,
        completed: false,
        row,
        column,
        value,
      };
    }

    /*
     * Apply the correct value.
     */
    const board = state.board.split('');

    /*
     * Don't allow an already-filled cell
     * to be overwritten.
     *
     * This is defensive because the client
     * can send duplicate move events.
     */
    if (board[index] !== '.') {
      /*
       * If it already contains the correct
       * value, treat the move as successful
       * without changing state.
       */
      if (board[index] === String(value)) {
        const completed = board.join('') === state.solution;

        return {
          ok: true,
          correct: true,
          completed,
          row,
          column,
          value,
        };
      }

      return {
        ok: false,
        reason: 'Cell is already filled',
      };
    }

    board[index] = String(value);

    const nextBoard = board.join('');

    const completed = nextBoard === state.solution;

    state.board = nextBoard;

    state.finished = completed;

    await this.redisService.setWithExpiry(
      this.getPlayerKey(battleId, userId),
      JSON.stringify(state),
      this.stateTtlSeconds,
    );

    return {
      ok: true,
      correct: true,
      completed,
      row,
      column,
      value,
    };
  }

  async removeGame(battleId: string, userIds: string[]): Promise<void> {
    await Promise.all(
      userIds.map((userId) =>
        this.redisService.delete(this.getPlayerKey(battleId, userId)),
      ),
    );
  }
}
