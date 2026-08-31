import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppText } from '@/components/common/AppText'

type ProfileSummaryProps = {
  displayName: string
  username: string
  friendsCount: number
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    alignItems: 'center',
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: '700',
  },

  displayName: {
    marginTop: theme.spacing.lg,
    fontSize: 22,
    fontWeight: '700',
  },

  username: {
    marginTop: 3,
    color: theme.colors.textMuted,
    fontSize: 14,
  },

  friends: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
}))

export function ProfileSummary({
  displayName,
  username,
  friendsCount,
}: ProfileSummaryProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <AppText style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </AppText>
      </View>

      <AppText style={styles.displayName}>
        {displayName}
      </AppText>

      <AppText style={styles.username}>
        @{username}
      </AppText>

      <AppText style={styles.friends}>
        {friendsCount} friends
      </AppText>
    </View>
  )
}