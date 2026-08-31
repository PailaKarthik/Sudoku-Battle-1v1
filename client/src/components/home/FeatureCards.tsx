import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type FeatureCardsProps = {
  onBattlePress: () => void
  onDailyPress: () => void
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
}))

export function FeatureCards(_: FeatureCardsProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <View style={styles.container} />
  )
}
