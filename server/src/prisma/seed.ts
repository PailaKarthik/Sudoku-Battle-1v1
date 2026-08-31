import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured. Add it to server/.env.');
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  const twoByThree = await prisma.sudokuPuzzle.upsert({
    where: {
      id: 'seed-2x3-001',
    },

    update: {},

    create: {
      id: 'seed-2x3-001',
      puzzleId: 'seed-2x3-001',
      variant: 'TWO_BY_THREE',
      difficulty: 'EASY',
      difficultyScore: 0.25,
      clueCount: 25,
      estimatedSolveTime: 180,
      seed: 2001n,

      puzzle: JSON.stringify([
        [1, null, 3, 4, null, 6],
        [null, 5, 6, null, 2, 3],
        [2, 3, null, 5, 6, null],
        [5, null, 1, 2, null, 4],
        [3, 4, 5, null, 1, 2],
        [null, 1, 2, 3, 4, null],
      ]),

      solution: JSON.stringify([
        [1, 2, 3, 4, 5, 6],
        [4, 5, 6, 1, 2, 3],
        [2, 3, 4, 5, 6, 1],
        [5, 6, 1, 2, 3, 4],
        [3, 4, 5, 6, 1, 2],
        [6, 1, 2, 3, 4, 5],
      ]),
    },
  });

  const threeByThree = await prisma.sudokuPuzzle.upsert({
    where: {
      id: 'seed-3x3-001',
    },

    update: {},

    create: {
      id: 'seed-3x3-001',
      puzzleId: 'seed-3x3-001',
      variant: 'THREE_BY_THREE',
      difficulty: 'MEDIUM',
      difficultyScore: 0.5,
      clueCount: 30,
      estimatedSolveTime: 600,
      seed: 3001n,

      puzzle: JSON.stringify([
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],

        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],

        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9],
      ]),

      solution: JSON.stringify([
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],

        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],

        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
      ]),
    },
  });

  console.log({
    twoByThree: twoByThree.id,
    threeByThree: threeByThree.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
