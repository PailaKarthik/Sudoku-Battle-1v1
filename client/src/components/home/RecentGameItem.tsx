import { Ionicons } from "@expo/vector-icons";

import { View } from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import { AppCard } from "../common/AppCard";
import { AppText } from "../common/AppText";

export type RecentGame = {
  id: string;

  type: "battle" | "daily";

  variant: "2×3" | "3×3";

  opponent?: string;

  result: "win" | "loss" | "draw" | "completed";

  time: string;

  ratingChange?: number | null;

  ratingAfter?: number | null;
};

type RecentGameItemProps = {
  game: RecentGame;
};

const stylesheet = createStyleSheet((theme) => ({
  card: {
    width: "100%",

    minHeight: 76,

    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,

    flexDirection: "row",

    alignItems: "center",
  },

  resultIcon: {
    width: 42,
    height: 42,

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",
  },

  win: {
    backgroundColor: theme.colors.successSoft,
  },

  loss: {
    backgroundColor: theme.colors.errorSoft,
  },

  draw: {
    backgroundColor: theme.colors.primarySoft,
  },

  completed: {
    backgroundColor: theme.colors.primarySoft,
  },

  content: {
    flex: 1,

    minWidth: 0,

    marginLeft: theme.spacing.md,
  },

  titleRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: theme.spacing.xs,
  },

  title: {
    color: theme.colors.text,

    fontSize: 15,

    fontWeight: "700",
  },

  variant: {
    color: theme.colors.textMuted,

    fontSize: 12,
  },

  subtitle: {
    marginTop: 3,

    color: theme.colors.textMuted,

    fontSize: 12,
  },

  right: {
    marginLeft: theme.spacing.sm,

    minWidth: 58,

    alignItems: "flex-end",
  },

  time: {
    color: theme.colors.text,

    fontSize: 13,

    fontWeight: "700",
  },

  ratingPositive: {
    marginTop: 3,

    color: theme.colors.success,

    fontSize: 12,

    fontWeight: "700",
  },

  ratingNegative: {
    marginTop: 3,

    color: theme.colors.error,

    fontSize: 12,

    fontWeight: "700",
  },

  ratingNeutral: {
    marginTop: 3,

    color: theme.colors.textMuted,

    fontSize: 12,

    fontWeight: "700",
  },
}));

export function RecentGameItem({ game }: RecentGameItemProps) {
  const { styles, theme } = useStyles(stylesheet);

  const iconName =
    game.result === "win"
      ? "trophy-outline"
      : game.result === "loss"
        ? "close-circle-outline"
        : "remove-circle-outline";

  const resultStyle =
    game.result === "win"
      ? styles.win
      : game.result === "loss"
        ? styles.loss
        : game.result === "draw"
          ? styles.draw
          : styles.completed;

  const iconColor =
    game.result === "win"
      ? theme.colors.success
      : game.result === "loss"
        ? theme.colors.error
        : theme.colors.primary;

  const title =
    game.type === "daily"
      ? "Daily Sudoku"
      : game.result === "win"
        ? "Victory"
        : game.result === "loss"
          ? "Defeat"
          : "Draw";

  const subtitle =
    game.type === "daily"
      ? "Daily challenge completed"
      : `vs ${game.opponent ?? "Player"}`;

  const formattedRatingChange =
    game.ratingChange === null || game.ratingChange === undefined
      ? null
      : `${game.ratingChange > 0 ? "+" : ""}${game.ratingChange}`;

  return (
    <AppCard style={styles.card}>
      <View style={[styles.resultIcon, resultStyle]}>
        <Ionicons name={iconName} size={21} color={iconColor} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText style={styles.title}>{title}</AppText>

          <AppText style={styles.variant}>{game.variant}</AppText>
        </View>

        <AppText style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>

      <View style={styles.right}>
        <AppText style={styles.time}>{game.time}</AppText>

        {formattedRatingChange !== null ? (
          <AppText
            style={
              game.ratingChange! > 0
                ? styles.ratingPositive
                : game.ratingChange! < 0
                  ? styles.ratingNegative
                  : styles.ratingNeutral
            }
          >
            {formattedRatingChange}
          </AppText>
        ) : null}
      </View>
    </AppCard>
  );
}
