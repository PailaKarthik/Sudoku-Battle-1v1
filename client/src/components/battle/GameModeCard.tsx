import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppCard } from '@/components/common/AppCard'
import { AppText } from '@/components/common/AppText'

type GameModeCardProps = {
  variant: '2×3' | '3×3'
  rating: number
  subtitle: string
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
    justifyContent: 'center',
    alignItems: 'center',
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

  rating: {
    marginTop: theme.spacing.lg,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
}))

export function GameModeCard({
  variant,
  rating,
  subtitle,
  onPress,
}: GameModeCardProps) {
  const { styles, theme } = useStyles(stylesheet)

  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Ionicons
            name="grid-outline"
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

      <AppText style={styles.subtitle}>{subtitle}</AppText>

      <AppText style={styles.rating}>
        Rating {rating}
      </AppText>
    </AppCard>
  )
}