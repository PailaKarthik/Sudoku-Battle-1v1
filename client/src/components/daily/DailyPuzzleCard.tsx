import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppCard } from '@/components/common/AppCard'
import { AppText } from '@/components/common/AppText'

export type DailyPuzzleStatus = 'available' | 'completed'

type DailyPuzzleCardProps = {
  variant: '2×3' | '3×3'
  status: DailyPuzzleStatus
  bestTime: string
  onPress: () => void
}

const stylesheet = createStyleSheet((theme) => ({
  card: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  variant: {
    marginTop: theme.spacing.lg,
    fontSize: 22,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },

  bottom: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  status: {
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: '600',
  },

  available: {
    color: theme.colors.primary,
  },

  bestTime: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
}))

export function DailyPuzzleCard({
  variant,
  status,
  bestTime,
  onPress,
}: DailyPuzzleCardProps) {
  const { styles, theme } = useStyles(stylesheet)

  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={theme.colors.primary}
          />
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textMuted}
        />
      </View>

      <AppText style={styles.variant}>{variant}</AppText>

      <AppText style={styles.subtitle}>
        {variant === '2×3'
          ? 'Fast 6 × 6 Sudoku'
          : 'Classic 9 × 9 Sudoku'}
      </AppText>

      <View style={styles.bottom}>
        <AppText
          style={[
            styles.status,
            status === 'available' && styles.available,
          ]}
        >
          {status === 'completed'
            ? 'Completed'
            : 'Play today'}
        </AppText>

        <AppText style={styles.bestTime}>
          Best: {bestTime}
        </AppText>
      </View>
    </AppCard>
  )
}