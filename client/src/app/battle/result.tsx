import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import { useEffect, useMemo, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { getBattleResult } from "../../services/api/battleApi";

import { useAppSelector } from "../../store/hooks";

import { formatTime } from "../../utils/formatTime";

type BattlePlayer = {
  userId: string;
  result: "WIN" | "LOSS" | "DRAW" | null;
  completionTimeMs: number | null;
  ratingBefore: number | null;
  ratingChange: number | null;
  ratingAfter: number | null;
};

type BattleResultData = {
  id: string;
  winnerId: string;
  players: BattlePlayer[];
};

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xxl,
  },

  badge: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  winBadge: {
    backgroundColor: theme.colors.successSoft,
  },

  lossBadge: {
    backgroundColor: theme.colors.errorSoft,
  },

  badgeText: {
    fontFamily: theme.typography.fontExtraBold,
    fontSize: 38,
    
  },

  winBadgeText: {
    color: theme.colors.success,
  },

  lossBadgeText: {
    color: theme.colors.error,
  },

  title: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.hero,
    
    textAlign: "center",
  },

  winTitle: {
    color: theme.colors.success,
  },

  lossTitle: {
    color: theme.colors.error,
  },

  subtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.md,
    textAlign: "center",
  },

  card: {
    width: "100%",
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },

  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
  },

  value: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  positive: {
    color: theme.colors.ratingPositive,
  },

  negative: {
    color: theme.colors.ratingNegative,
  },

  button: {
    width: "100%",
    height: 54,
    marginTop: theme.spacing.xl,
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
}));

export default function BattleResultScreen() {
  const { styles } = useStyles(stylesheet);

  const params = useLocalSearchParams<{
    battleId?: string;
  }>();

  const battleId = Array.isArray(params.battleId)
    ? params.battleId[0]
    : params.battleId;

  const currentUser = useAppSelector((state) => state.auth.user);

  const reduxResult = useAppSelector(
    (state) => state.battle.result,
  ) as BattleResultData | null;

  const [result, setResult] = useState<BattleResultData | null>(reduxResult);

  const [loading, setLoading] = useState(!reduxResult);

  useEffect(() => {
    if (!battleId || result) {
      return;
    }

    let mounted = true;

    async function loadResult() {
      try {
        const data = (await getBattleResult(battleId)) as BattleResultData;

        if (mounted) {
          setResult(data);
        }
      } catch (error) {
        if (mounted) {
          Toast.show({
            type: "error",
            text1: "Could not load battle result",
            text2: error instanceof Error ? error.message : "Please try again.",
            position: "top",
          });
        }
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
  }, [battleId, result]);

  const myPlayer = useMemo(
    () =>
      result?.players.find((player) => player.userId === currentUser?.id) ??
      null,
    [result, currentUser?.id],
  );

  const winnerPlayer = useMemo(
    () =>
      result?.players.find((player) => player.userId === result?.winnerId) ??
      null,
    [result],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!result || !myPlayer) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text
            style={{
              color: "#ef4444",
              fontSize: 16,
            }}
          >
            Unable to load battle result.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const won = result.winnerId === currentUser?.id;

  const winningTime = winnerPlayer?.completionTimeMs ?? 0;

  const ratingChange = myPlayer.ratingChange ?? 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={[styles.badge, won ? styles.winBadge : styles.lossBadge]}>
          <Text
            style={[
              styles.badgeText,
              won ? styles.winBadgeText : styles.lossBadgeText,
            ]}
          >
            {won ? "✓" : "×"}
          </Text>
        </View>

        <Text style={[styles.title, won ? styles.winTitle : styles.lossTitle]}>
          {won ? "Victory" : "Defeat"}
        </Text>

        <Text style={styles.subtitle}>
          {won
            ? "You solved the puzzle first."
            : "Your opponent solved the puzzle first."}
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Winning time</Text>

            <Text style={styles.value}>{formatTime(winningTime)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Your result</Text>

            <Text style={styles.value}>{won ? "WIN" : "LOSS"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Rating</Text>

            <Text
              style={[
                styles.value,
                ratingChange > 0
                  ? styles.positive
                  : ratingChange < 0
                    ? styles.negative
                    : null,
              ]}
            >
              {ratingChange > 0 ? `+${ratingChange}` : ratingChange}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>New rating</Text>

            <Text style={styles.value}>{myPlayer.ratingAfter ?? "—"}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => router.replace("/")}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
