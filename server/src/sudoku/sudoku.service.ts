import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { SudokuVariant } from '../generated/prisma/client.js';

@Injectable()
export class SudokuService {
  constructor(private readonly prisma: PrismaService) {}

  async getRandomPuzzle(variant: SudokuVariant) {
    const puzzles = await this.prisma.sudokuPuzzle.findMany({
      where: {
        variant,
      },

      select: {
        puzzleId: true,
        variant: true,
        puzzle: true,
        solution: true,
        difficulty: true,
        difficultyScore: true,
        clueCount: true,
        estimatedSolveTime: true,
        seed: true,
      },
    });

    if (puzzles.length === 0) {
      throw new NotFoundException(`No puzzles available for ${variant}`);
    }

    const randomIndex = Math.floor(Math.random() * puzzles.length);

    return puzzles[randomIndex];
  }

  async getPuzzle(puzzleId: string) {
    const puzzle = await this.prisma.sudokuPuzzle.findUnique({
      where: { puzzleId },
      select: {
        puzzleId: true,
        variant: true,
        puzzle: true,
        solution: true,
        difficulty: true,
        difficultyScore: true,
        clueCount: true,
        estimatedSolveTime: true,
        seed: true,
      },
    });

    if (!puzzle) {
      throw new NotFoundException('Sudoku puzzle not found');
    }

    return puzzle;
  }
}
