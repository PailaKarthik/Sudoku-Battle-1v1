import { ReactNode } from 'react'
import { Pressable, PressableProps } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const stylesheet = createStyleSheet((theme) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },

  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
}))

type AppCardProps = PressableProps & {
  children: ReactNode
}

export function AppCard({
  children,
  style,
  ...props
}: AppCardProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.card,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  )
}
