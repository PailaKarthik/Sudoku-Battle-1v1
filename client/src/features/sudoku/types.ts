export type SudokuVariant = "2x3" | "3x3";

export type SudokuCell = number | null;

export type SudokuGrid = SudokuCell[][];

export type SudokuPuzzle = {
  id: string;
  variant: SudokuVariant;
  puzzle: SudokuGrid;
  solution: number[][];
};

export type SudokuGameState = {
  variant: SudokuVariant;
  puzzle: SudokuGrid;
  board: SudokuGrid;
  solution: number[][];
  selectedRow: number | null;
  selectedColumn: number | null;
  completed: boolean;
};
