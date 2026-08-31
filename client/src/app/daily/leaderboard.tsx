import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { getDailyLeaderboard } from "../../services/api/dailyApi";

import type { DailyLeaderboardEntry } from "../../features/daily/types";

import DailyLeaderboard from "../../components/daily/DailyLeaderboard";

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,

    backgroundColor: theme.colors.background,
  },

  header: {
    minHeight: 72,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: theme.spacing.xxl,

    paddingVertical: theme.spacing.md,

    backgroundColor: theme.colors.background,

    borderBottomWidth: 1,

    borderBottomColor: theme.colors.border,

    zIndex: 10,

    elevation: 4,
  },

  headerSide: {
    width: 40,

    alignItems: "flex-start",

    justifyContent: "center",
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

  headerCenter: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: theme.spacing.md,
  },

  title: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.xl,

    

    lineHeight: 25,

    includeFontPadding: false,
  },

  headerSubtitle: {
    marginTop: 3,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.xs,

    lineHeight: 16,

    includeFontPadding: false,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: theme.spacing.xxl,

    paddingTop: theme.spacing.xl,

    paddingBottom: theme.spacing.xxxl,
  },

  intro: {
    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 20,
  },

  tabs: {
    flexDirection: "row",

    padding: 4,

    marginTop: theme.spacing.lg,

    borderRadius: theme.radius.lg,

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,

    borderColor: theme.colors.border,
  },

  tab: {
    flex: 1,

    height: 42,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: theme.radius.md,
  },

  activeTab: {
    backgroundColor: theme.colors.surface,

    elevation: 1,
  },

  tabText: {
    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontSemiBold,

    fontSize: theme.typography.sm,

    

    includeFontPadding: false,
  },

  activeTabText: {
    color: theme.colors.primary,

    fontWeight: "800",
  },

  listContainer: {
    marginTop: theme.spacing.xl,
  },

  loadingContainer: {
    minHeight: 180,

    alignItems: "center",

    justifyContent: "center",
  },

  errorContainer: {
    marginTop: theme.spacing.xl,

    padding: theme.spacing.lg,

    borderRadius: theme.radius.lg,

    backgroundColor: theme.colors.errorSoft,

    borderWidth: 1,

    borderColor: theme.colors.error,
  },

  errorText: {
    color: theme.colors.error,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,

    textAlign: "center",
  },

  retryButton: {
    height: 44,

    marginTop: theme.spacing.md,

    borderRadius: theme.radius.md,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.error,
  },

  retryText: {
    color: theme.colors.textInverse,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.sm,

    

    includeFontPadding: false,
  },
}));

export default function DailyLeaderboardScreen() {
  const { styles } = useStyles(stylesheet);

  const params = useLocalSearchParams<{
    challengeId?: string;
  }>();

  const challengeId = Array.isArray(params.challengeId)
    ? params.challengeId[0]
    : params.challengeId;

  const [scope, setScope] = useState<"global" | "friends">("global");

  const [entries, setEntries] = useState<DailyLeaderboardEntry[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(
    async (selectedScope: "global" | "friends") => {
      if (!challengeId) {
        setError("Daily challenge ID is missing.");

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setError(null);

        const result = await getDailyLeaderboard(challengeId, selectedScope);

        setEntries(result);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load leaderboard.";

        setError(message);

        console.error("[Daily Leaderboard] Load failed:", requestError);
      } finally {
        setLoading(false);
      }
    },
    [challengeId],
  );

  useEffect(() => {
    void loadLeaderboard(scope);
  }, [loadLeaderboard, scope]);

  async function handleRefresh() {
    try {
      setRefreshing(true);

      await loadLeaderboard(scope);
    } finally {
      setRefreshing(false);
    }
  }

  function handleScopeChange(nextScope: "global" | "friends") {
    if (nextScope === scope || loading) {
      return;
    }

    setScope(nextScope);
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="auto" />

      {/* Fixed header */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,

              pressed
                ? {
                    opacity: 0.7,
                    transform: [
                      {
                        scale: 0.96,
                      },
                    ],
                  }
                : null,
            ]}
          >
            <Ionicons name="chevron-back" size={19} color="#2563EB" />
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Leaderboard</Text>

          <Text style={styles.headerSubtitle}>Daily 6×6 challenge</Text>
        </View>

        <View
          style={[
            styles.headerSide,
            {
              alignItems: "flex-end",
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.intro}>
          Fastest completion time ranks highest. Switch between global players
          and your friends.
        </Text>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => handleScopeChange("global")}
            disabled={loading}
            style={[styles.tab, scope === "global" ? styles.activeTab : null]}
          >
            <Text
              style={[
                styles.tabText,

                scope === "global" ? styles.activeTabText : null,
              ]}
            >
              Global
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleScopeChange("friends")}
            disabled={loading}
            style={[styles.tab, scope === "friends" ? styles.activeTab : null]}
          >
            <Text
              style={[
                styles.tabText,

                scope === "friends" ? styles.activeTabText : null,
              ]}
            >
              Friends
            </Text>
          </Pressable>
        </View>

        <View style={styles.listContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>

              <Pressable
                style={styles.retryButton}
                onPress={() => void loadLeaderboard(scope)}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          ) : (
            <DailyLeaderboard entries={entries} loading={false} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
