import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppText } from '@/components/common/AppText'

type RatingSummaryProps = {
  rating2x3: number
  rating3x3: number
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    marginBottom: theme.spacing.xl,
  },

  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },

  ratings: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },

  item: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  variant: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },

  rating: {
    marginTop: theme.spacing.xs,
    fontSize: 24,
    fontWeight: '700',
  },
}))

export function RatingSummary({
  rating2x3,
  rating3x3,
}: RatingSummaryProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>Your Ratings</AppText>

      <View style={styles.ratings}>
        <View style={styles.item}>
          <AppText style={styles.variant}>2 × 3</AppText>
          <AppText style={styles.rating}>{rating2x3}</AppText>
        </View>

        <View style={styles.item}>
          <AppText style={styles.variant}>3 × 3</AppText>
          <AppText style={styles.rating}>{rating3x3}</AppText>
        </View>
      </View>
    </View>
  )
}