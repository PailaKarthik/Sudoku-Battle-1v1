import { Module } from '@nestjs/common';

import { SudokuController } from './sudoku.controller.js';
import { SudokuService } from './sudoku.service.js';

@Module({
  controllers: [SudokuController],
  providers: [SudokuService],
  exports: [SudokuService],
})
export class SudokuModule {}
