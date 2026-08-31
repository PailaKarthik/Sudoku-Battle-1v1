import { ReactNode } from 'react'
import { ScrollView, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const stylesheet = createStyleSheet((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
}))

type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  contentStyle?: ViewStyle
}

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: ScreenProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.content, contentStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  )
}