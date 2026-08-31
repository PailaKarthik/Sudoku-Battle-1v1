import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppText } from '@/components/common/AppText'

export type BattleLeader = {
  rank: number
  username: string
  rating: number
}

type BattleLeaderboardProps = {
  players: BattleLeader[]
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    marginTop: theme.spacing.xxxl,
  },

  title: {
    marginBottom: theme.spacing.md,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  rank: {
    width: 32,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },

  username: {
    flex: 1,
    fontWeight: '500',
  },

  rating: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
}))

export function BattleLeaderboard({
  players,
}: BattleLeaderboardProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <View style={styles.container}>
      <AppText variant="sectionTitle" style={styles.title}>
        Leaderboard
      </AppText>

      {players.map((player) => (
        <View key={player.rank} style={styles.row}>
          <AppText style={styles.rank}>
            #{player.rank}
          </AppText>

          <AppText style={styles.username}>
            {player.username}
          </AppText>

          <AppText style={styles.rating}>
            {player.rating}
          </AppText>
        </View>
      ))}
    </View>
  )
}