/*
  Warnings:

  - You are about to drop the column `createdBy` on the `SudokuPuzzle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[puzzleId]` on the table `SudokuPuzzle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clueCount` to the `SudokuPuzzle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficultyScore` to the `SudokuPuzzle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedSolveTime` to the `SudokuPuzzle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `puzzleId` to the `SudokuPuzzle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seed` to the `SudokuPuzzle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SudokuPuzzle" DROP CONSTRAINT "SudokuPuzzle_createdBy_fkey";

-- DropIndex
DROP INDEX "SudokuPuzzle_createdAt_idx";

-- AlterTable
ALTER TABLE "SudokuPuzzle" DROP COLUMN "createdBy",
ADD COLUMN     "clueCount" INTEGER NOT NULL,
ADD COLUMN     "difficultyScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "estimatedSolveTime" INTEGER NOT NULL,
ADD COLUMN     "puzzleId" TEXT NOT NULL,
ADD COLUMN     "seed" BIGINT NOT NULL,
ALTER COLUMN "variant" SET DEFAULT 'TWO_BY_THREE',
ALTER COLUMN "puzzle" SET DATA TYPE TEXT,
ALTER COLUMN "solution" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SudokuPuzzle_puzzleId_key" ON "SudokuPuzzle"("puzzleId");

-- CreateIndex
CREATE INDEX "SudokuPuzzle_variant_idx" ON "SudokuPuzzle"("variant");

-- CreateIndex
CREATE INDEX "SudokuPuzzle_variant_difficultyScore_idx" ON "SudokuPuzzle"("variant", "difficultyScore");
