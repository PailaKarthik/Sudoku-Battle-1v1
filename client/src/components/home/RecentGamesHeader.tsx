import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { AppText } from '../common/AppText'

const stylesheet = createStyleSheet((theme) => ({
  container: {
    marginTop: theme.spacing.xxxl,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  count: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
}))

export function RecentGamesHeader() {
  const { styles } = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <AppText variant="sectionTitle">
        Recent Games
      </AppText>

      <AppText style={styles.count}>
        Latest activity
      </AppText>
    </View>
  )
}