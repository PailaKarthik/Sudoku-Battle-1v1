import { Pressable, Text, View } from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import type { SudokuGrid } from "../../features/sudoku/types";

const stylesheet = createStyleSheet((theme) => ({
  board: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.border,
  },

  row: {
    flex: 1,
    flexDirection: "row",
  },

  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: theme.colors.border,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },

  blockRightDivider: {
    borderRightWidth: 3,
    borderRightColor: theme.colors.borderStrong,
  },

  blockBottomDivider: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.borderStrong,
  },

  lastColumn: {
    borderRightWidth: 0,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  fixedCell: {
    backgroundColor: theme.colors.primarySoft,
  },

  selectedCell: {
    backgroundColor: theme.colors.sudokuSelected,
  },

  cellText: {
    color: theme.colors.sudokuEditable,
    fontFamily: theme.typography.fontBold,
    fontSize: 20,
    
  },

  fixedText: {
    color: theme.colors.sudokuFixed,
  },
}));

type Props = {
  board: SudokuGrid;
  originalBoard: SudokuGrid;
  selectedCell: {
    row: number;
    column: number;
  } | null;
  onSelect: (row: number, column: number) => void;
};

export default function SudokuBoard({
  board,
  originalBoard,
  selectedCell,
  onSelect,
}: Props) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.board}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((value, columnIndex) => {
            const fixed = originalBoard[rowIndex][columnIndex] !== null;

            const selected =
              selectedCell?.row === rowIndex &&
              selectedCell?.column === columnIndex;

            return (
              <Pressable
                key={`${rowIndex}-${columnIndex}`}
                style={[
                  styles.cell,
                  // A 6×6 puzzle has 3-column × 2-row regions.
                  columnIndex === 2 ? styles.blockRightDivider : null,
                  rowIndex === 1 || rowIndex === 3
                    ? styles.blockBottomDivider
                    : null,
                  columnIndex === board.length - 1 ? styles.lastColumn : null,
                  rowIndex === board.length - 1 ? styles.lastRow : null,
                  fixed ? styles.fixedCell : null,
                  selected ? styles.selectedCell : null,
                ]}
                onPress={() => onSelect(rowIndex, columnIndex)}
              >
                <Text
                  style={[styles.cellText, fixed ? styles.fixedText : null]}
                >
                  {value ?? ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
