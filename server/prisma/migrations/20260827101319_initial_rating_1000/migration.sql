-- AlterTable
ALTER TABLE "BattlePlayer" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "rating" SET DEFAULT 1000,
ALTER COLUMN "highestRating" SET DEFAULT 1000;
