import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { getTodayDaily, submitDailyAttempt } from "../../services/api/dailyApi";

import { stringToGrid } from "../../features/sudoku/sudoku";

import type { SudokuGrid } from "../../features/sudoku/types";

import { useSudokuTimer } from "../../features/sudoku/useSudokuTimer";

import { formatTime } from "../../utils/formatTime";

const NUMBERS = [1, 2, 3, 4, 5, 6];

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

  backButton: {
    width: 40,
    height: 40,

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  title: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.xl,

    

    includeFontPadding: false,
  },

  timer: {
    minWidth: 78,
    height: 40,

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

  boardContainer: {
    width: "100%",

    marginTop: theme.spacing.xl,

    alignItems: "center",
  },

  board: {
    width: "100%",

    aspectRatio: 1,

    borderWidth: 2,

    borderColor: theme.colors.borderStrong,

    borderRadius: theme.radius.sm,

    overflow: "hidden",

    backgroundColor: theme.colors.surface,
  },

  row: {
    flex: 1,
    flexDirection: "row",
  },

  cell: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.surface,

    borderRightWidth: 1,
    borderBottomWidth: 1,

    borderColor: theme.colors.border,
  },

  boxRightBorder: {
    borderRightWidth: 2.5,
    borderRightColor: theme.colors.borderStrong,
  },

  boxBottomBorder: {
    borderBottomWidth: 2.5,
    borderBottomColor: theme.colors.borderStrong,
  },

  fixedCell: {
    backgroundColor: theme.colors.primarySoft,
  },

  selectedCell: {
    backgroundColor: theme.colors.sudokuSelected,
  },

  cellText: {
    color: theme.colors.sudokuEditable,

    fontFamily: theme.typography.fontBold,

    fontSize: 20,

    

    includeFontPadding: false,
  },

  fixedText: {
    color: theme.colors.sudokuFixed,
  },

  keypad: {
    marginTop: theme.spacing.xl,

    gap: theme.spacing.sm,
  },

  keypadRow: {
    flexDirection: "row",

    gap: theme.spacing.sm,
  },

  numberButton: {
    flex: 1,

    height: 48,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: theme.radius.md,

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  numberButtonDisabled: {
    opacity: 0.45,
  },

  numberText: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.lg,

    

    includeFontPadding: false,
  },

  eraseButton: {
    height: 48,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: theme.radius.md,

    backgroundColor: theme.colors.primarySoft,
  },

  eraseButtonDisabled: {
    opacity: 0.45,
  },

  eraseText: {
    color: theme.colors.primary,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.sm,

    
  },

  submissionBox: {
    marginTop: theme.spacing.xl,

    minHeight: 56,

    paddingHorizontal: theme.spacing.lg,

    borderRadius: theme.radius.lg,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,

    borderColor: theme.colors.primary,
  },

  submissionText: {
    marginLeft: theme.spacing.sm,

    color: theme.colors.primary,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.sm,

    

    textAlign: "center",
  },

  failureBox: {
    marginTop: theme.spacing.xl,

    padding: theme.spacing.md,

    borderRadius: theme.radius.lg,

    backgroundColor: theme.colors.errorSoft,

    borderWidth: 1,

    borderColor: theme.colors.error,
  },

  failureText: {
    color: theme.colors.error,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,

    textAlign: "center",
  },

  helper: {
    marginTop: theme.spacing.md,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,

    textAlign: "center",
  },

  error: {
    color: theme.colors.error,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 20,

    textAlign: "center",
  },

  loading: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    padding: theme.spacing.xxl,

    backgroundColor: theme.colors.background,
  },
}));

export default function DailyPuzzleScreen() {
  const { styles } = useStyles(stylesheet);

  const params = useLocalSearchParams<{
    challengeId?: string;
  }>();

  const challengeId = Array.isArray(params.challengeId)
    ? params.challengeId[0]
    : params.challengeId;

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [puzzle, setPuzzle] = useState<SudokuGrid | null>(null);

  const [originalPuzzle, setOriginalPuzzle] = useState<SudokuGrid | null>(null);

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    column: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const submittingRef = useRef(false);

  const { elapsedMs } = useSudokuTimer(
    !loading && puzzle !== null && !submitting,
  );

  useEffect(() => {
    let mounted = true;

    async function loadPuzzle() {
      try {
        if (!challengeId) {
          throw new Error("Daily challenge ID is missing.");
        }

        setLoading(true);
        setError(null);

        const challenge = await getTodayDaily("2x3");

        if (!mounted) {
          return;
        }

        if (challenge.id !== challengeId) {
          throw new Error("This daily challenge is no longer available.");
        }

        /*
         * Already completed:
         * go directly to result.
         */
        if (challenge.completed) {
          router.replace({
            pathname: "/daily/result",
            params: {
              challengeId,
              completionTimeMs: String(
                challenge.attempt?.completionTimeMs ?? 0,
              ),
            },
          });

          return;
        }

        const grid = stringToGrid(challenge.puzzle.puzzle, "2x3");

        if (!mounted) {
          return;
        }

        setPuzzle(grid);

        setOriginalPuzzle(grid.map((row) => [...row]));
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the puzzle.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadPuzzle();

    return () => {
      mounted = false;
    };
  }, [challengeId]);

  function isBoardComplete(board: SudokuGrid): boolean {
    return !board.some((row) => row.some((cell) => cell === null));
  }

  async function submitCompletedBoard(board: SudokuGrid) {
    if (!challengeId || submittingRef.current || !isBoardComplete(board)) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(true);
    setSubmissionError(null);

    console.log("[Daily] Submitting completed board", {
      challengeId,
      completionTimeMs: elapsedMs,
      board,
    });

    function toNumberGrid(board: SudokuGrid): number[][] {
      return board.map((row) =>
        row.map((cell) => {
          if (cell === null) {
            throw new Error("Cannot submit an incomplete board.");
          }

          return cell;
        }),
      );
    }

    try {
      const numberBoard = toNumberGrid(board);

      const result = await submitDailyAttempt(
        challengeId,
        elapsedMs,
        numberBoard,
      );

      console.log("[Daily] Submission succeeded", result);

      /*
       * Important:
       *
       * Set submitting false before
       * navigation so this screen is not
       * left in a disabled state if the
       * router transition takes a moment.
       */
      setSubmitting(false);

      submittingRef.current = false;

      Toast.show({
        type: "success",
        text1: "Puzzle solved!",
        text2: `Your time: ${formatTime(result.completionTimeMs)}`,
      });

      /*
       * Use push instead of replace.
       * This makes the navigation explicit
       * and easier to verify while testing.
       */
      router.push({
        pathname: "/daily/result",
        params: {
          challengeId,
          completionTimeMs: String(result.completionTimeMs),
        },
      });
    } catch (submitError) {
      console.error("[Daily] Submission failed", submitError);

      const message =
        submitError instanceof Error
          ? submitError.message
          : "The server rejected the solution.";

      submittingRef.current = false;

      setSubmitting(false);

      setSubmissionError(message);

      Toast.show({
        type: "error",
        text1: "Solution not accepted",
        text2: message,
      });
    }
  }

  function handleNumber(value: number) {
    if (!puzzle || !originalPuzzle || !selectedCell || submitting) {
      return;
    }

    const { row, column } = selectedCell;

    if (originalPuzzle[row][column] !== null) {
      return;
    }

    const nextBoard = puzzle.map((currentRow) => [...currentRow]);

    nextBoard[row][column] = value;

    setPuzzle(nextBoard);

    /*
     * Once the last cell is filled,
     * automatically submit.
     */
    if (isBoardComplete(nextBoard)) {
      void submitCompletedBoard(nextBoard);
    }
  }

  function handleErase() {
    if (!puzzle || !originalPuzzle || !selectedCell || submitting) {
      return;
    }

    const { row, column } = selectedCell;

    if (originalPuzzle[row][column] !== null) {
      return;
    }

    const nextBoard = puzzle.map((currentRow) => [...currentRow]);

    nextBoard[row][column] = null;

    setPuzzle(nextBoard);

    /*
     * Once the user changes a cell after
     * an incorrect submission, clear the
     * old submission message.
     */
    if (submissionError) {
      setSubmissionError(null);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.screen}
        edges={["top", "bottom", "left", "right"]}
      >
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!puzzle || !originalPuzzle) {
    return (
      <SafeAreaView
        style={styles.screen}
        edges={["top", "bottom", "left", "right"]}
      >
        <View style={styles.loading}>
          <Text style={styles.error}>
            {error ?? "Unable to load this puzzle."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={submitting}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color="#2563EB" />
          </Pressable>

          <Text style={styles.title}>Daily 6×6</Text>

          <View style={styles.timer}>
            <Text style={styles.timerText}>{formatTime(elapsedMs)}</Text>
          </View>
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.board}>
            {puzzle.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((value, columnIndex) => {
                  const fixed = originalPuzzle[rowIndex][columnIndex] !== null;

                  const selected =
                    selectedCell?.row === rowIndex &&
                    selectedCell?.column === columnIndex;

                  const boxRight = columnIndex === 2;

                  const boxBottom = rowIndex === 1 || rowIndex === 3;

                  return (
                    <Pressable
                      key={`${rowIndex}-${columnIndex}`}
                      disabled={submitting}
                      onPress={() =>
                        setSelectedCell({
                          row: rowIndex,
                          column: columnIndex,
                        })
                      }
                      style={[
                        styles.cell,

                        fixed ? styles.fixedCell : null,

                        selected ? styles.selectedCell : null,

                        boxRight ? styles.boxRightBorder : null,

                        boxBottom ? styles.boxBottomBorder : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellText,

                          fixed ? styles.fixedText : null,
                        ]}
                      >
                        {value ?? ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            {NUMBERS.slice(0, 3).map((number) => (
              <Pressable
                key={number}
                disabled={submitting}
                style={[
                  styles.numberButton,
                  submitting ? styles.numberButtonDisabled : null,
                ]}
                onPress={() => handleNumber(number)}
              >
                <Text style={styles.numberText}>{number}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.keypadRow}>
            {NUMBERS.slice(3, 6).map((number) => (
              <Pressable
                key={number}
                disabled={submitting}
                style={[
                  styles.numberButton,
                  submitting ? styles.numberButtonDisabled : null,
                ]}
                onPress={() => handleNumber(number)}
              >
                <Text style={styles.numberText}>{number}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            disabled={submitting}
            style={[
              styles.eraseButton,
              submitting ? styles.eraseButtonDisabled : null,
            ]}
            onPress={handleErase}
          >
            <Text style={styles.eraseText}>Erase selected cell</Text>
          </Pressable>
        </View>

        {submitting ? (
          <View style={styles.submissionBox}>
            <ActivityIndicator size="small" color="#2563EB" />

            <Text style={styles.submissionText}>Checking your solution...</Text>
          </View>
        ) : submissionError ? (
          <View style={styles.failureBox}>
            <Text style={styles.failureText}>{submissionError}</Text>

            <Text
              style={[
                styles.failureText,
                {
                  marginTop: 4,
                },
              ]}
            >
              Correct the entries and fill the board again to resubmit.
            </Text>
          </View>
        ) : (
          <Text style={styles.helper}>
            Fill the final cell to automatically submit your solution.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
