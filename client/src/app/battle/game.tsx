import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import SudokuBoard from "../../components/battle/SudokuBoard";
import NumberPad from "../../components/battle/NumberPad";

import {
  connectSocket,
  joinBattle,
  sendBattleMove,
} from "../../services/socket/socket";

import { SOCKET_EVENTS } from "../../services/socket/events";

import {
  setCountdown,
  setBattleStarted,
  addMove,
  setBattleResult,
  setBattleError,
} from "../../features/battle/battleSlice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { stringToGrid } from "../../features/sudoku/sudoku";

import type { SudokuGrid } from "../../features/sudoku/types";

import { useSudokuTimer } from "../../features/sudoku/useSudokuTimer";

import { formatTime } from "../../utils/formatTime";

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flexGrow: 1,

    paddingHorizontal: theme.spacing.xl,

    paddingTop: theme.spacing.lg,

    paddingBottom: theme.spacing.xxxl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back: {
    width: 42,
    height: 42,

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  backText: {
    color: theme.colors.primary,
    fontSize: 22,
  },

  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.xl,
    
    includeFontPadding: false,
  },

  timer: {
    minWidth: 78,
    height: 42,

    paddingHorizontal: theme.spacing.md,

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  timerText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
    includeFontPadding: false,
  },

  waiting: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    padding: theme.spacing.xxl,
  },

  countdown: {
    fontFamily: theme.typography.fontExtraBold,
    fontSize: 72,
    
    color: theme.colors.primary,
  },

  waitingTitle: {
    marginTop: theme.spacing.lg,

    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.xxl,

    

    textAlign: "center",
  },

  waitingText: {
    marginTop: theme.spacing.sm,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.md,

    lineHeight: 21,

    textAlign: "center",
  },

  boardContainer: {
    marginTop: theme.spacing.xl,

    position: "relative",
  },

  opponent: {
    marginTop: theme.spacing.md,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    textAlign: "center",
  },

  submittingOverlay: {
    position: "absolute",

    left: 12,
    right: 12,
    bottom: 12,

    minHeight: 52,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: theme.spacing.sm,

    borderRadius: theme.radius.lg,

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,

    elevation: 6,
  },

  submittingText: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.sm,

    
  },

  error: {
    marginTop: theme.spacing.xl,

    color: theme.colors.error,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 20,

    textAlign: "center",
  },
}));

type BattleStartedPayload = {
  battleId: string;

  variant: "TWO_BY_THREE" | "THREE_BY_THREE";

  startedAt: string | null;

  puzzle: {
    puzzleId: string;

    variant: "TWO_BY_THREE" | "THREE_BY_THREE";

    puzzle: string;

    difficulty: string;

    difficultyScore: number;

    clueCount: number;

    estimatedSolveTime: number;
  };

  players: Array<{
    userId: string;
    slot: number;
  }>;
};

type BattleMovePayload = {
  userId: string;
  row: number;
  column: number;
  value: number;
};

type BattleMoveResultPayload = {
  correct: boolean;
  row: number;
  column: number;
  value: number;
};

type BattleFinishedPlayer = {
  userId: string;
  slot: number;

  result: "WIN" | "LOSS" | "DRAW" | null;

  completionTimeMs: number | null;

  ratingBefore: number | null;

  ratingChange: number | null;

  ratingAfter: number | null;
};

type BattleFinishedPayload = {
  battleId: string;

  winnerId: string;

  players: BattleFinishedPlayer[];
};

export default function BattleGameScreen() {
  const { styles } = useStyles(stylesheet);

  const params = useLocalSearchParams<{
    battleId?: string;
  }>();

  const battleId = Array.isArray(params.battleId)
    ? params.battleId[0]
    : params.battleId;

  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const { phase, countdown, started } = useAppSelector((state) => state.battle);

  const [board, setBoard] = useState<SudokuGrid | null>(null);

  const [originalBoard, setOriginalBoard] = useState<SudokuGrid | null>(null);

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    column: number;
  } | null>(null);

  const [pendingMove, setPendingMove] = useState<{
    row: number;
    column: number;
    previousValue: number | null;
  } | null>(null);

  const [finishing, setFinishing] = useState(false);

  const { elapsedMs } = useSudokuTimer(phase === "playing");

  const size = useMemo(() => {
    if (!started) {
      return 6;
    }

    return started.variant === "TWO_BY_THREE" ? 6 : 9;
  }, [started]);

  useEffect(() => {
    if (!battleId) {
      dispatch(setBattleError("Battle ID is missing."));

      return;
    }

    let mounted = true;

    let currentSocket: Awaited<ReturnType<typeof connectSocket>> | null = null;

    /*
     * Keep cleanup references outside setup()
     * so the useEffect cleanup can access them.
     */
    let onJoined: ((data?: { battleId?: string }) => void) | null = null;

    let onCountdown:
      | ((data: { battleId: string; seconds: number }) => void)
      | null = null;

    let onStarted: ((data: BattleStartedPayload) => void) | null = null;

    let onMove: ((data: BattleMovePayload) => void) | null = null;

    let onMoveResult: ((data: BattleMoveResultPayload) => void) | null = null;

    let onFinished: ((data: BattleFinishedPayload) => void) | null = null;

    let onStartFailed: ((data?: { battleId?: string }) => void) | null = null;

    async function setup() {
      try {
        console.log("[Battle Game] Connecting socket", {
          battleId,
          userId: user?.id,
        });

        currentSocket = await connectSocket();

        if (!mounted || !currentSocket) {
          return;
        }

        onJoined = (data?: { battleId?: string }) => {
          if (data?.battleId && data.battleId !== battleId) {
            return;
          }

          console.log("[Battle Game] Joined battle", {
            battleId,
            socketId: currentSocket?.id,
            userId: user?.id,
          });
        };

        onCountdown = (data: { battleId: string; seconds: number }) => {
          if (data.battleId !== battleId) {
            return;
          }

          console.log("[Battle Game] Countdown", data);

          dispatch(setCountdown(data.seconds));
        };

        onStarted = (data: BattleStartedPayload) => {
          if (data.battleId !== battleId) {
            return;
          }

          console.log("[Battle Game] Battle started", {
            battleId,
            variant: data.variant,
          });

          dispatch(setBattleStarted({
            ...data,
            players: data.players.map((player) => ({
              ...player,
              result: null,
              completionTimeMs: null,
              ratingBefore: null,
              ratingChange: null,
              ratingAfter: null,
            })),
          }));

          const variant = data.variant === "TWO_BY_THREE" ? "2x3" : "3x3";

          const nextBoard = stringToGrid(data.puzzle.puzzle, variant);

          setBoard(nextBoard);

          setOriginalBoard(nextBoard.map((row) => [...row]));

          setSelectedCell(null);

          setPendingMove(null);

          setFinishing(false);
        };

        onMove = (data: BattleMovePayload) => {
          if (!mounted) {
            return;
          }

          /*
           * Store move history.
           */
          dispatch(addMove(data));

          /*
           * Only our own move needs its
           * pending state cleared.
           */
          if (data.userId === user?.id) {
            setPendingMove((current) => {
              if (
                !current ||
                current.row !== data.row ||
                current.column !== data.column
              ) {
                return current;
              }

              return null;
            });
          }
        };

        onMoveResult = (data: BattleMoveResultPayload) => {
          if (!mounted) {
            return;
          }

          /*
           * Correct move:
           * battle.move will confirm it.
           */
          if (data.correct) {
            return;
          }

          /*
           * Incorrect move:
           * remove the optimistic value.
           */
          setBoard((current) => {
            if (!current) {
              return current;
            }

            const next = current.map((row) => [...row]);

            next[data.row][data.column] = null;

            return next;
          });

          setPendingMove(null);

          /*
           * If the incorrect move was the
           * final cell, unlock the board.
           */
          setFinishing(false);

          Toast.show({
            type: "error",

            text1: "Incorrect move",

            text2: "Check that cell and try again.",

            position: "top",
          });
        };

        onFinished = (data: BattleFinishedPayload) => {
          if (data.battleId !== battleId) {
            return;
          }

          console.log("[Battle Game] Battle finished", {
            battleId,
            winnerId: data.winnerId,
            currentUserId: user?.id,
          });

          /*
           * Immediately stop interaction.
           */
          setFinishing(true);

          setPendingMove(null);

          /*
           * Store server-authoritative
           * result in Redux.
           */
          dispatch(setBattleResult(data));

          /*
           * Both players go to the same
           * result screen using the same
           * battle ID.
           */
          router.replace({
            pathname: "/battle/result",

            params: {
              battleId: data.battleId,
            },
          });
        };

        onStartFailed = (data?: { battleId?: string }) => {
          if (data?.battleId && data.battleId !== battleId) {
            return;
          }

          console.error("[Battle Game] Battle start failed", {
            battleId,
          });

          dispatch(setBattleError("Battle could not start."));

          Toast.show({
            type: "error",

            text1: "Battle failed to start",

            text2: "Please leave the battle and try again.",

            position: "top",
          });
        };

        /*
         * Register listeners BEFORE
         * calling joinBattle().
         */
        currentSocket.on(SOCKET_EVENTS.BATTLE_JOINED, onJoined);

        currentSocket.on(SOCKET_EVENTS.BATTLE_COUNTDOWN, onCountdown);

        currentSocket.on(SOCKET_EVENTS.BATTLE_STARTED, onStarted);

        currentSocket.on(SOCKET_EVENTS.BATTLE_MOVE, onMove);

        currentSocket.on(SOCKET_EVENTS.BATTLE_MOVE_RESULT, onMoveResult);

        currentSocket.on(SOCKET_EVENTS.BATTLE_FINISHED, onFinished);

        currentSocket.on(SOCKET_EVENTS.BATTLE_START_FAILED, onStartFailed);

        console.log("[Battle Game] Joining battle", {
          battleId,
          socketId: currentSocket.id,
          userId: user?.id,
        });

        await joinBattle(battleId);
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to connect to battle.";

        console.error("[Battle Game] Setup failed", {
          battleId,
          userId: user?.id,
          error,
        });

        dispatch(setBattleError(message));

        Toast.show({
          type: "error",

          text1: "Battle connection failed",

          text2: message,

          position: "top",
        });
      }
    }

    void setup();

    /*
     * Correct cleanup.
     *
     * We remove only the listeners
     * created by this component.
     */
    return () => {
      mounted = false;

      if (!currentSocket) {
        return;
      }

      if (onJoined) {
        currentSocket.off(SOCKET_EVENTS.BATTLE_JOINED, onJoined);
      }

      if (onCountdown) {
        currentSocket.off(SOCKET_EVENTS.BATTLE_COUNTDOWN, onCountdown);
      }

      if (onStarted) {
        currentSocket.off(SOCKET_EVENTS.BATTLE_STARTED, onStarted);
      }

      if (onMove) {
        currentSocket.off(SOCKET_EVENTS.BATTLE_MOVE, onMove);
      }

      if (onMoveResult) {
        currentSocket.off(SOCKET_EVENTS.BATTLE_MOVE_RESULT, onMoveResult);
      }

      if (onFinished) {
        currentSocket.off(SOCKET_EVENTS.BATTLE_FINISHED, onFinished);
      }

      if (onStartFailed) {
        currentSocket.off(SOCKET_EVENTS.BATTLE_START_FAILED, onStartFailed);
      }
    };
  }, [battleId, dispatch, user?.id]);

  function isBoardComplete(value: SudokuGrid): boolean {
    return value.every((row) => row.every((cell) => cell !== null));
  }

  function selectCell(row: number, column: number) {
    if (phase !== "playing" || finishing || !originalBoard) {
      return;
    }

    if (originalBoard[row][column] !== null) {
      return;
    }

    /*
     * Do not allow another cell to be
     * selected while this cell's move
     * is still waiting for server
     * confirmation.
     */
    if (pendingMove) {
      return;
    }

    setSelectedCell({
      row,
      column,
    });
  }

  async function playNumber(value: number) {
    if (
      !battleId ||
      !board ||
      !originalBoard ||
      !selectedCell ||
      phase !== "playing" ||
      finishing
    ) {
      return;
    }

    const { row, column } = selectedCell;

    /*
     * Fixed clue.
     */
    if (originalBoard[row][column] !== null) {
      return;
    }

    /*
     * Don't send another move while
     * previous move is waiting for the
     * server.
     */
    if (pendingMove !== null) {
      return;
    }

    const previousValue = board[row][column];

    const next = board.map((currentRow) => [...currentRow]);

    next[row][column] = value;

    /*
     * Optimistic UI update.
     */
    setBoard(next);

    setPendingMove({
      row,
      column,
      previousValue,
    });

    const finalCell = isBoardComplete(next);

    if (finalCell) {
      /*
       * Lock the interface while the
       * server checks the winning move.
       */
      setFinishing(true);
    }

    try {
      await sendBattleMove(battleId, row, column, value);
    } catch (error) {
      /*
       * Restore the previous value if
       * the socket request itself failed.
       */
      setBoard((current) => {
        if (!current) {
          return current;
        }

        const reverted = current.map((currentRow) => [...currentRow]);

        reverted[row][column] = previousValue;

        return reverted;
      });

      setPendingMove(null);

      setFinishing(false);

      Toast.show({
        type: "error",

        text1: "Move could not be sent",

        text2: error instanceof Error ? error.message : "Please try again.",

        position: "top",
      });
    }
  }

  function eraseCell() {
    if (
      !board ||
      !originalBoard ||
      !selectedCell ||
      phase !== "playing" ||
      finishing
    ) {
      return;
    }

    /*
     * Don't erase while a move is
     * waiting for server confirmation.
     */
    if (pendingMove) {
      return;
    }

    const { row, column } = selectedCell;

    /*
     * Fixed clue.
     */
    if (originalBoard[row][column] !== null) {
      return;
    }

    const next = board.map((currentRow) => [...currentRow]);

    next[row][column] = null;

    setBoard(next);
  }

  if (!battleId) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.waiting}>
          <Text style={styles.error}>Battle ID is missing.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "countdown" || phase === "ready") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.waiting}>
          <Text style={styles.countdown}>{countdown ?? "..."}</Text>

          <Text style={styles.waitingTitle}>Get ready</Text>

          <Text style={styles.waitingText}>
            Both players are connected. The battle starts automatically.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "matching" || phase === "idle") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.waiting}>
          <ActivityIndicator size="large" />

          <Text style={styles.waitingTitle}>Connecting to battle...</Text>

          <Text style={styles.waitingText}>
            Waiting for both players to join the battle room.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!board || !originalBoard || !started) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.waiting}>
          <ActivityIndicator />

          <Text style={styles.waitingTitle}>Preparing puzzle...</Text>

          {phase === "error" ? (
            <Text style={styles.error}>The battle could not be started.</Text>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={() => router.back()}
            disabled={finishing}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            {size === 6 ? "6×6 Battle" : "9×9 Battle"}
          </Text>

          <View style={styles.timer}>
            <Text style={styles.timerText}>{formatTime(elapsedMs)}</Text>
          </View>
        </View>

        {started.players.length > 1 ? (
          <Text style={styles.opponent}>
            Opponent connected • solve faster to win
          </Text>
        ) : null}

        <View style={styles.boardContainer}>
          <SudokuBoard
            board={board}
            originalBoard={originalBoard}
            selectedCell={selectedCell}
            onSelect={selectCell}
          />

          {finishing ? (
            <View style={styles.submittingOverlay}>
              <ActivityIndicator size="small" color="#2563EB" />

              <Text style={styles.submittingText}>
                Checking your solution...
              </Text>
            </View>
          ) : null}
        </View>

        {/*
         * Do NOT pass disabled here.
         *
         * Your current NumberPad implementation
         * has not been shown to define a disabled
         * prop. playNumber() and eraseCell()
         * already enforce the lock while finishing.
         */}
        <NumberPad size={size} onNumber={playNumber} onErase={eraseCell} />
      </ScrollView>
    </SafeAreaView>
  );
}
