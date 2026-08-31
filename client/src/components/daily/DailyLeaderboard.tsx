import { ActivityIndicator, Text, View } from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import type { DailyLeaderboardEntry } from "../../features/daily/types";

import { formatTime } from "../../utils/formatTime";

const stylesheet = createStyleSheet((theme) => ({
  container: {
    gap: theme.spacing.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  current: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },

  rank: {
    width: 34,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.md,
    
  },

  details: {
    flex: 1,
  },

  name: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  username: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  time: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  empty: {
    padding: theme.spacing.xxl,
    alignItems: "center",
  },

  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    textAlign: "center",
  },
}));

type Props = {
  entries: DailyLeaderboardEntry[];
  loading: boolean;
};

export default function DailyLeaderboard({ entries, loading }: Props) {
  const { styles } = useStyles(stylesheet);

  if (loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator />
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No completed results yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {entries.map((entry) => {
        const name = entry.user.displayName ?? entry.user.username ?? "Player";

        return (
          <View
            key={entry.user.id}
            style={[styles.row, entry.isCurrentUser ? styles.current : null]}
          >
            <Text style={styles.rank}>{entry.rank}</Text>

            <View style={styles.details}>
              <Text style={styles.name}>{name}</Text>

              {entry.user.username ? (
                <Text style={styles.username}>@{entry.user.username}</Text>
              ) : null}
            </View>

            <Text style={styles.time}>
              {formatTime(entry.completionTimeMs)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
