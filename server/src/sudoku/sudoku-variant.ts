import { SudokuVariant } from '../generated/prisma/client.js';

export function toPrismaSudokuVariant(variant: '2x3' | '3x3'): SudokuVariant {
  return variant === '2x3'
    ? SudokuVariant.TWO_BY_THREE
    : SudokuVariant.THREE_BY_THREE;
}

export function toApiSudokuVariant(variant: SudokuVariant): '2x3' | '3x3' {
  return variant === SudokuVariant.TWO_BY_THREE ? '2x3' : '3x3';
}
