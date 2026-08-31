import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppButton } from '@/components/common/AppButton'
import { AppText } from '@/components/common/AppText'

type DailyResultProps = {
  time: string
  bestTime: string
  rank: number
  onLeaderboard: () => void
  onHome: () => void
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    marginBottom: theme.spacing.xl,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
  },

  time: {
    marginTop: theme.spacing.sm,
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },

  details: {
    marginTop: theme.spacing.xxxl,
    alignItems: 'center',
  },

  detail: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },

  actions: {
    width: '100%',
    marginTop: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
}))

export function DailyResult({
  time,
  bestTime,
  rank,
  onLeaderboard,
  onHome,
}: DailyResultProps) {
  const { styles, theme } = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <Ionicons
        name="checkmark-circle"
        size={72}
        color={theme.colors.success}
        style={styles.icon}
      />

      <AppText style={styles.title}>
        Challenge Complete
      </AppText>

      <AppText style={styles.time}>
        {time}
      </AppText>

      <View style={styles.details}>
        <AppText style={styles.detail}>
          Personal Best: {bestTime}
        </AppText>

        <AppText style={styles.detail}>
          Today's Rank: #{rank}
        </AppText>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="View Leaderboard"
          onPress={onLeaderboard}
        />

        <AppButton
          title="Back to Home"
          variant="secondary"
          onPress={onHome}
        />
      </View>
    </View>
  )
}