import { ReactNode } from 'react'
import { Text, TextProps } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const stylesheet = createStyleSheet((theme) => ({
  text: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontRegular,
  },

  title: {
    fontSize: 28,
    fontFamily: theme.typography.fontBold,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontRegular,
    color: theme.colors.textSecondary,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontSemiBold,
  },

  body: {
    fontSize: 15,
    fontFamily: theme.typography.fontRegular,
  },
}))

type AppTextProps = TextProps & {
  variant?: 'title' | 'subtitle' | 'sectionTitle' | 'body'
  children: ReactNode
}

export function AppText({
  variant = 'body',
  style,
  children,
  ...props
}: AppTextProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <Text
      {...props}
      style={[styles.text, styles[variant], style]}
    >
      {children}
    </Text>
  )
}
