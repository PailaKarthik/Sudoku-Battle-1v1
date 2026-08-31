import { Pressable, PressableProps, Text } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type AppButtonProps = PressableProps & {
  title: string
  variant?: 'primary' | 'secondary'
}

const stylesheet = createStyleSheet((theme) => ({
  button: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  primary: {
    backgroundColor: theme.colors.primary,
  },

  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  primaryText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontSemiBold,
    fontSize: 16,
  },

  secondaryText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontSemiBold,
    fontSize: 16,
  },
}))

export function AppButton({
  title,
  variant = 'primary',
  style,
  ...props
}: AppButtonProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        state.pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text
        style={
          variant === 'primary'
            ? styles.primaryText
            : styles.secondaryText
        }
      >
        {title}
      </Text>
    </Pressable>
  )
}
