import { useCallback, useEffect, useState } from "react";

import { ActivityIndicator, Text, View } from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import {
  getRecentBattles,
  type RecentBattle,
} from "../../services/api/battleApi";

import { formatTime } from "../../utils/formatTime";

import { RecentGameItem, type RecentGame } from "./RecentGameItem";

import { RecentGamesHeader } from "./RecentGamesHeader";

type Props = {
  refreshKey?: number;
};

const stylesheet = createStyleSheet((theme) => ({
  section: {
    marginTop: theme.spacing.xl,
  },

  card: {
    marginTop: theme.spacing.md,

    overflow: "hidden",

    borderRadius: theme.radius.xl,

    borderWidth: 1,

    borderColor: theme.colors.border,

    backgroundColor: theme.colors.surface,
  },

  divider: {
    height: 1,

    backgroundColor: theme.colors.border,
  },

  loading: {
    minHeight: 110,

    alignItems: "center",

    justifyContent: "center",
  },

  empty: {
    minHeight: 110,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: theme.spacing.xl,

    paddingVertical: theme.spacing.xl,
  },

  emptyTitle: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    
  },

  emptyText: {
    marginTop: theme.spacing.xs,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,

    textAlign: "center",
  },

  error: {
    minHeight: 110,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: theme.spacing.xl,
  },

  errorText: {
    color: theme.colors.error,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    textAlign: "center",
  },
}));

function mapRecentBattle(battle: RecentBattle): RecentGame {
  const opponentName =
    battle.opponent?.displayName ?? battle.opponent?.username ?? "Player";

  return {
    id: battle.id,

    type: "battle",

    variant: battle.variant,

    opponent: opponentName,

    result: battle.result,

    time: formatTime(battle.completionTimeMs ?? 0),

    ratingChange: battle.ratingChange,

    ratingAfter: battle.ratingAfter,
  };
}

export default function RecentGames({ refreshKey = 0 }: Props) {
  const { styles } = useStyles(stylesheet);

  const [battles, setBattles] = useState<RecentBattle[]>([]);

  const [loading, setLoading] = useState(true);

  const loadRecentGames = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getRecentBattles();

      setBattles(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("[Home] Recent battles API failed:", error);

      Toast.show({
        type: "error",
        text1: "Could not load recent games",
        text2: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecentGames();
  }, [loadRecentGames, refreshKey]);

  const games = battles.map(mapRecentBattle);

  return (
    <View style={styles.section}>
      <RecentGamesHeader />

      <View style={styles.card}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        ) : games.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No games yet</Text>

            <Text style={styles.emptyText}>
              Your completed battles will appear here.
            </Text>
          </View>
        ) : (
          games.map((game, index) => (
            <View key={game.id}>
              <RecentGameItem game={game} />

              {index < games.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
}
