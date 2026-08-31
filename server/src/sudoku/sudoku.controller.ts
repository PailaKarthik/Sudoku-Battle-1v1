import { Controller, Get, Param, Query } from '@nestjs/common';

import { SudokuService } from './sudoku.service.js';

import { GetRandomPuzzleDto } from './dto/get-random-puzzle.dto.js';

import { toPrismaSudokuVariant } from './sudoku-variant.js';

@Controller('sudoku')
export class SudokuController {
  constructor(private readonly sudokuService: SudokuService) {}

  @Get('puzzles/random')
  getRandomPuzzle(@Query() query: GetRandomPuzzleDto) {
    return this.sudokuService.getRandomPuzzle(
      toPrismaSudokuVariant(query.variant),
    );
  }

  @Get('puzzles/:puzzleId')
  getPuzzle(@Param('puzzleId') puzzleId: string) {
    return this.sudokuService.getPuzzle(puzzleId);
  }
}
