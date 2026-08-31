import type { SudokuGrid, SudokuPuzzle, SudokuVariant } from "./types";

export function getSize(variant: SudokuVariant): number {
  return variant === "2x3" ? 6 : 9;
}

export function stringToGrid(
  value: string,
  variant: SudokuVariant,
): SudokuGrid {
  const size = getSize(variant);

  const expectedLength = size * size;

  if (value.length !== expectedLength) {
    throw new Error(
      `Invalid Sudoku string length. Expected ${expectedLength}, received ${value.length}.`,
    );
  }

  const grid: SudokuGrid = [];

  for (let row = 0; row < size; row += 1) {
    const currentRow: SudokuGrid[number] = [];

    for (let column = 0; column < size; column += 1) {
      const character = value[row * size + column];

      if (character === ".") {
        currentRow.push(null);
        continue;
      }

      const number = Number(character);

      if (!Number.isInteger(number) || number < 1 || number > size) {
        throw new Error(`Invalid Sudoku value "${character}".`);
      }

      currentRow.push(number);
    }

    grid.push(currentRow);
  }

  return grid;
}

export function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map((row) => [...row]);
}

export function stringToSolution(
  value: string,
  variant: SudokuVariant,
): number[][] {
  const size = getSize(variant);

  if (value.length !== size * size) {
    throw new Error("Invalid Sudoku solution length.");
  }

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) =>
      Number(value[row * size + column]),
    ),
  );
}

export function createPuzzleFromBackend(data: {
  puzzleId: string;
  variant: "TWO_BY_THREE" | "THREE_BY_THREE";
  puzzle: string;
  solution?: string;
}): SudokuPuzzle {
  const variant: SudokuVariant =
    data.variant === "TWO_BY_THREE" ? "2x3" : "3x3";

  if (!data.solution) {
    throw new Error("Sudoku solution is not available.");
  }

  return {
    id: data.puzzleId,
    variant,
    puzzle: stringToGrid(data.puzzle, variant),
    solution: stringToSolution(data.solution, variant),
  };
}

export function setCellValue(
  board: SudokuGrid,
  row: number,
  column: number,
  value: number | null,
): SudokuGrid {
  const nextBoard = cloneGrid(board);

  nextBoard[row][column] = value;

  return nextBoard;
}

export function isCellCorrect(
  solution: number[][],
  row: number,
  column: number,
  value: number | null,
): boolean {
  if (value === null) {
    return false;
  }

  return solution[row][column] === value;
}

export function isBoardComplete(
  board: SudokuGrid,
  solution: number[][],
): boolean {
  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      if (board[row][column] !== solution[row][column]) {
        return false;
      }
    }
  }

  return true;
}
