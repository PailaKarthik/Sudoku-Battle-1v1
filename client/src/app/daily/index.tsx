import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { getTodayDaily } from "../../services/api/dailyApi";

import type { DailyChallenge } from "../../features/daily/types";

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,

    backgroundColor: theme.colors.background,
  },

  content: {
    flexGrow: 1,

    paddingHorizontal: theme.spacing.xxl,

    paddingTop: theme.spacing.xl,

    paddingBottom: theme.spacing.xxxl,
  },

  backButton: {
    width: 38,
    height: 38,

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.surface,

    borderWidth: 1,

    borderColor: theme.colors.border,
  },

  title: {
    marginTop: theme.spacing.xxl,

    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.hero,

    

    includeFontPadding: false,
  },

  subtitle: {
    marginTop: theme.spacing.sm,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.md,

    lineHeight: 22,
  },

  card: {
    marginTop: theme.spacing.xl,

    padding: theme.spacing.xl,

    borderWidth: 1,

    borderColor: theme.colors.border,

    borderRadius: theme.radius.xxl,

    backgroundColor: theme.colors.surface,
  },

  completedBanner: {
    flexDirection: "row",

    alignItems: "center",

    padding: theme.spacing.md,

    borderRadius: theme.radius.lg,

    backgroundColor: theme.colors.successSoft,
  },

  completedIcon: {
    width: 34,
    height: 34,

    borderRadius: theme.radius.full,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.success,
  },

  completedTextContainer: {
    flex: 1,

    marginLeft: theme.spacing.md,
  },

  completedTitle: {
    color: theme.colors.success,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.sm,

    
  },

  completedTime: {
    marginTop: 2,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.xs,
  },

  label: {
    marginTop: theme.spacing.xl,

    color: theme.colors.primary,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.sm,

    
  },

  value: {
    marginTop: theme.spacing.xs,

    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.xl,

    
  },

  stats: {
    flexDirection: "row",

    gap: theme.spacing.sm,

    marginTop: theme.spacing.xl,
  },

  stat: {
    flex: 1,

    padding: theme.spacing.md,

    borderRadius: theme.radius.md,

    backgroundColor: theme.colors.primarySoft,
  },

  statLabel: {
    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.xs,
  },

  statValue: {
    marginTop: 3,

    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    
  },

  primaryButton: {
    height: 54,

    marginTop: theme.spacing.xl,

    borderRadius: theme.radius.lg,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primary,
  },

  secondaryButton: {
    height: 52,

    marginTop: theme.spacing.sm,

    borderRadius: theme.radius.lg,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,

    borderColor: theme.colors.primary,
  },

  primaryButtonText: {
    color: theme.colors.textInverse,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    
  },

  secondaryButtonText: {
    color: theme.colors.primary,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    
  },

  error: {
    marginTop: theme.spacing.lg,

    color: theme.colors.error,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 20,
  },

  loading: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.background,
  },
}));

function formatCompletedTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default function DailyIndexScreen() {
  const { styles } = useStyles(stylesheet);

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadChallenge = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      const result = await getTodayDaily("2x3");

      setChallenge(result);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load today's challenge.";

      setError(message);

      Toast.show({
        type: "error",
        text1: "Daily challenge unavailable",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.screen}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView
        style={styles.screen}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#2563EB" />
          </Pressable>

          <Text style={styles.title}>Daily Sudoku</Text>

          <Text style={styles.error}>
            {error ?? "No daily challenge is available right now."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const estimatedMinutes = Math.ceil(challenge.puzzle.estimatedSolveTime / 60);

  const completed = challenge.completed;

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#2563EB" />
        </Pressable>

        <Text style={styles.title}>Daily Sudoku</Text>

        <Text style={styles.subtitle}>
          A new challenge is selected each day. Solve it as fast as possible and
          compete on the leaderboard.
        </Text>

        <View style={styles.card}>
          {completed ? (
            <View style={styles.completedBanner}>
              <View style={styles.completedIcon}>
                <Ionicons name="checkmark" size={19} color="#FFFFFF" />
              </View>

              <View style={styles.completedTextContainer}>
                <Text style={styles.completedTitle}>Today's puzzle solved</Text>

                {challenge.attempt ? (
                  <Text style={styles.completedTime}>
                    Your time:{" "}
                    {formatCompletedTime(challenge.attempt.completionTimeMs)}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          <Text style={styles.label}>TODAY'S CHALLENGE</Text>

          <Text style={styles.value}>6 × 6 Sudoku</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Difficulty</Text>

              <Text style={styles.statValue}>
                {challenge.puzzle.difficulty}
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Estimated Time</Text>

              <Text style={styles.statValue}>{estimatedMinutes} min</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Clues</Text>

              <Text style={styles.statValue}>{challenge.puzzle.clueCount}</Text>
            </View>
          </View>

          {completed ? (
            <>
              <Pressable
                style={styles.primaryButton}
                onPress={() =>
                  router.push({
                    pathname: "/daily/result",
                    params: {
                      challengeId: challenge.id,

                      completionTimeMs: String(
                        challenge.attempt?.completionTimeMs ?? 0,
                      ),
                    },
                  })
                }
              >
                <Text style={styles.primaryButtonText}>View Result</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  router.push({
                    pathname: "/daily/leaderboard",
                    params: {
                      challengeId: challenge.id,
                    },
                  })
                }
              >
                <Text style={styles.secondaryButtonText}>View Leaderboard</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                router.push({
                  pathname: "/daily/puzzle",
                  params: {
                    challengeId: challenge.id,
                  },
                })
              }
            >
              <Text style={styles.primaryButtonText}>Solve Today Puzzle</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
