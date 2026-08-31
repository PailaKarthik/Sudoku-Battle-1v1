import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppButton } from '@/components/common/AppButton'
import { AppText } from '@/components/common/AppText'

type BattleResultProps = {
  won: boolean
  ratingChange: number
  oldRating: number
  newRating: number
  time: string
  onPlayAgain: () => void
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
    fontSize: 32,
    fontWeight: '700',
  },

  rating: {
    marginTop: theme.spacing.sm,
    color: theme.colors.primary,
    fontSize: 24,
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

export function BattleResult({
  won,
  ratingChange,
  oldRating,
  newRating,
  time,
  onPlayAgain,
  onHome,
}: BattleResultProps) {
  const { styles, theme } = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <Ionicons
        name={won ? 'trophy' : 'sad-outline'}
        size={72}
        color={won ? theme.colors.success : theme.colors.error}
        style={styles.icon}
      />

      <AppText style={styles.title}>
        {won ? 'Victory' : 'Defeat'}
      </AppText>

      <AppText style={styles.rating}>
        {ratingChange >= 0 ? '+' : ''}
        {ratingChange} Rating
      </AppText>

      <View style={styles.details}>
        <AppText style={styles.detail}>
          Rating {oldRating} → {newRating}
        </AppText>

        <AppText style={styles.detail}>
          Time {time}
        </AppText>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Play Again"
          onPress={onPlayAgain}
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