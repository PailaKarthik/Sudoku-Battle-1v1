import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { createStyleSheet, useStyles } from "react-native-unistyles";

type DailyChallengePreview = {
  id: string;
  puzzle: {
    difficulty: string;
    estimatedSolveTime: number;
  };
};

const stylesheet = createStyleSheet((theme) => ({
  card: {
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },

  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
  },

  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
  },

  title: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.xxl,
  },

  description: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    lineHeight: 19,
  },

  stats: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },

  stat: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
  },

  statLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontMedium,
    fontSize: theme.typography.xs,
  },

  statValue: {
    marginTop: 2,
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
  },

  button: {
    height: 48,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  buttonText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
  },

  error: {
    marginTop: theme.spacing.md,
    color: theme.colors.error,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
  },
}));

type Props = {
  challenge: DailyChallengePreview | null;
  loading: boolean;
  error: string | null;
};

export default function DailyCard({ challenge, loading, error }: Props) {
  const { styles, theme } = useStyles(stylesheet);

  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.card}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>DAILY SUDOKU</Text>
          <View style={styles.iconBadge}><Ionicons name="calendar-outline" size={20} color={theme.colors.primary} /></View>
        </View>

        <Text style={styles.title}>Today's challenge</Text>

        <Text style={styles.description}>
          The daily puzzle is currently unavailable.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
  const estimatedMinutes = Math.ceil(challenge.puzzle.estimatedSolveTime / 60);

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>DAILY SUDOKU</Text>
        <View style={styles.iconBadge}><Ionicons name="calendar-outline" size={20} color={theme.colors.primary} /></View>
      </View>

      <Text style={styles.title}>Today's 6×6</Text>

      <Text style={styles.description}>
        Complete today's puzzle and compete on the global and friends
        leaderboard.
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Difficulty</Text>

          <Text style={styles.statValue}>{challenge.puzzle.difficulty}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Estimated Time</Text>

          <Text style={styles.statValue}>
            {estimatedMinutes} min
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/daily",
            params: {
              challengeId: challenge.id,
            },
          })
        }
      >
        <Text style={styles.buttonText}>Play</Text>
      </Pressable>
    </View>
  );
}
