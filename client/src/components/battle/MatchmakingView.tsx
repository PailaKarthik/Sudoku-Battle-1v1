import { ActivityIndicator, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppText } from '@/components/common/AppText'
import { AppButton } from '@/components/common/AppButton'

type MatchmakingViewProps = {
  variant: '2×3' | '3×3'
  onCancel: () => void
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  indicator: {
    marginBottom: theme.spacing.xxl,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },

  button: {
    marginTop: theme.spacing.xxxl,
    width: '100%',
  },
}))

export function MatchmakingView({
  variant,
  onCancel,
}: MatchmakingViewProps) {
  const { styles, theme } = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.indicator}
      />

      <AppText style={styles.title}>
        Finding opponent...
      </AppText>

      <AppText style={styles.subtitle}>
        Looking for a {variant} player around your rating.
      </AppText>

      <AppButton
        title="Cancel"
        variant="secondary"
        onPress={onCancel}
        style={styles.button}
      />
    </View>
  )
}