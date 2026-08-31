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

import { Ionicons } from "@expo/vector-icons";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import {
  getTodayDaily,
  getDailyLeaderboard,
} from "../../services/api/dailyApi";

import type {
  DailyChallenge,
  DailyLeaderboardEntry,
} from "../../features/daily/types";

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

  headerSpacer: {
    width: 40,
  },

  hero: {
    marginTop: theme.spacing.xxxl,
    alignItems: "center",
  },

  successIcon: {
    width: 76,
    height: 76,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },

  resultTitle: {
    marginTop: theme.spacing.xl,
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.hero,
    
    textAlign: "center",
  },

  resultSubtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.md,
    textAlign: "center",
  },

  timeCard: {
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.xxl,
    borderRadius: theme.radius.xxl,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  timeLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
  },

  time: {
    marginTop: theme.spacing.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: 42,
    
    includeFontPadding: false,
  },

  challengeInfo: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  section: {
    marginTop: theme.spacing.xxl,
  },

  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.lg,
    
  },

  rankCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  rankText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  rankSubtext: {
    marginTop: 3,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  button: {
    height: 54,
    marginTop: theme.spacing.xxl,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },

  buttonText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
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

  secondaryText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },

  error: {
    marginTop: theme.spacing.xl,
    color: theme.colors.error,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    textAlign: "center",
  },
}));

export default function DailyResultScreen() {
  const { styles } = useStyles(stylesheet);

  const params = useLocalSearchParams<{
    challengeId?: string;
    completionTimeMs?: string;
  }>();

  const challengeId = Array.isArray(params.challengeId)
    ? params.challengeId[0]
    : params.challengeId;

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);

  const [leaderboard, setLeaderboard] = useState<DailyLeaderboardEntry[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadResult() {
      if (!challengeId) {
        setError("Daily challenge ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [daily, globalLeaderboard] = await Promise.all([
          getTodayDaily("2x3"),
          getDailyLeaderboard(challengeId, "global"),
        ]);

        if (!mounted) {
          return;
        }

        setChallenge(daily);

        setLeaderboard(globalLeaderboard);
      } catch (resultError) {
        if (!mounted) {
          return;
        }

        const message =
          resultError instanceof Error
            ? resultError.message
            : "Unable to load your result.";

        setError(message);

        Toast.show({
          type: "error",
          text1: "Result could not be loaded",
          text2: message,
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadResult();

    return () => {
      mounted = false;
    };
  }, [challengeId]);

  const currentUserEntry = useMemo(
    () => leaderboard.find((entry) => entry.isCurrentUser),
    [leaderboard],
  );

  const completionTime =
    challenge?.attempt?.completionTimeMs ??
    Number(params.completionTimeMs ?? 0);

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

  if (!challenge) {
    return (
      <SafeAreaView
        style={styles.screen}
        edges={["top", "bottom", "left", "right"]}
      >
        <View style={styles.content}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#2563EB" />
          </Pressable>

          <Text style={styles.error}>{error ?? "Result is unavailable."}</Text>
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
            onPress={() => router.replace("/")}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color="#2563EB" />
          </Pressable>

          <Text style={styles.title}>Daily Result</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={38} color="#FFFFFF" />
          </View>

          <Text style={styles.resultTitle}>Puzzle Solved!</Text>

          <Text style={styles.resultSubtitle}>
            Your result has been recorded successfully.
          </Text>
        </View>

        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>YOUR TIME</Text>

          <Text style={styles.time}>{formatTime(completionTime)}</Text>

          <Text style={styles.challengeInfo}>
            6 × 6 • {challenge.puzzle.difficulty}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global ranking</Text>

          <View style={styles.rankCard}>
            {currentUserEntry ? (
              <>
                <Text style={styles.rankText}>
                  Rank #{currentUserEntry.rank}
                </Text>

                <Text style={styles.rankSubtext}>
                  {leaderboard.length} completed players
                </Text>
              </>
            ) : (
              <Text style={styles.rankText}>
                Your ranking is still being calculated.
              </Text>
            )}
          </View>
        </View>

        <Pressable
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/daily/leaderboard",
              params: {
                challengeId: challenge.id,
              },
            })
          }
        >
          <Text style={styles.buttonText}>View Leaderboard</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.secondaryText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
