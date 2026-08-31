import { Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { AppText } from '@/components/common/AppText'

type SudokuCellProps = {
  value: number | null
  selected: boolean
  editable: boolean
  onPress: () => void
}

const stylesheet = createStyleSheet((theme) => ({
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selected: {
    backgroundColor: theme.colors.primarySoft,
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
  },

  fixedValue: {
    color: theme.colors.text,
    fontWeight: '700',
  },

  selectedValue: {
    color: theme.colors.primary,
  },
}))

export function SudokuCell({
  value,
  selected,
  editable,
  onPress,
}: SudokuCellProps) {
  const { styles } = useStyles(stylesheet)

  return (
    <Pressable
      onPress={onPress}
      disabled={!editable}
      style={[
        styles.cell,
        selected && editable && styles.selected,
      ]}
    >
      {value !== null && (
        <AppText
          style={[
            styles.value,
            !editable && styles.fixedValue,
            selected && editable && styles.selectedValue,
          ]}
        >
          {value}
        </AppText>
      )}
    </Pressable>
  )
}