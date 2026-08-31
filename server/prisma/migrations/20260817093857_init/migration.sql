-- CreateEnum
CREATE TYPE "SudokuVariant" AS ENUM ('TWO_BY_THREE', 'THREE_BY_THREE');

-- CreateEnum
CREATE TYPE "SudokuDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('WAITING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BattleResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SudokuPuzzle" (
    "id" TEXT NOT NULL,
    "variant" "SudokuVariant" NOT NULL,
    "difficulty" "SudokuDifficulty" NOT NULL,
    "puzzle" JSONB NOT NULL,
    "solution" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SudokuPuzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "challengeDate" DATE NOT NULL,
    "variant" "SudokuVariant" NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAttempt" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completionTimeMs" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variant" "SudokuVariant" NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "highestRating" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "variant" "SudokuVariant" NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "status" "BattleStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattlePlayer" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "result" "BattleResult",
    "completionTimeMs" INTEGER,
    "ratingBefore" INTEGER,
    "ratingChange" INTEGER,
    "ratingAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattlePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_status_idx" ON "FriendRequest"("receiverId", "status");

-- CreateIndex
CREATE INDEX "FriendRequest_senderId_status_idx" ON "FriendRequest"("senderId", "status");

-- CreateIndex
CREATE INDEX "FriendRequest_createdAt_idx" ON "FriendRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "Friendship"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- CreateIndex
CREATE INDEX "SudokuPuzzle_variant_difficulty_idx" ON "SudokuPuzzle"("variant", "difficulty");

-- CreateIndex
CREATE INDEX "SudokuPuzzle_createdAt_idx" ON "SudokuPuzzle"("createdAt");

-- CreateIndex
CREATE INDEX "DailyChallenge_challengeDate_idx" ON "DailyChallenge"("challengeDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_challengeDate_variant_key" ON "DailyChallenge"("challengeDate", "variant");

-- CreateIndex
CREATE INDEX "DailyAttempt_challengeId_completionTimeMs_idx" ON "DailyAttempt"("challengeId", "completionTimeMs");

-- CreateIndex
CREATE INDEX "DailyAttempt_userId_completedAt_idx" ON "DailyAttempt"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAttempt_challengeId_userId_key" ON "DailyAttempt"("challengeId", "userId");

-- CreateIndex
CREATE INDEX "Rating_variant_rating_idx" ON "Rating"("variant", "rating");

-- CreateIndex
CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_variant_key" ON "Rating"("userId", "variant");

-- CreateIndex
CREATE INDEX "Battle_variant_status_idx" ON "Battle"("variant", "status");

-- CreateIndex
CREATE INDEX "Battle_createdAt_idx" ON "Battle"("createdAt");

-- CreateIndex
CREATE INDEX "BattlePlayer_userId_createdAt_idx" ON "BattlePlayer"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BattlePlayer_battleId_idx" ON "BattlePlayer"("battleId");

-- CreateIndex
CREATE UNIQUE INDEX "BattlePlayer_battleId_userId_key" ON "BattlePlayer"("battleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BattlePlayer_battleId_slot_key" ON "BattlePlayer"("battleId", "slot");

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SudokuPuzzle" ADD CONSTRAINT "SudokuPuzzle_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "SudokuPuzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttempt" ADD CONSTRAINT "DailyAttempt_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttempt" ADD CONSTRAINT "DailyAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "SudokuPuzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattlePlayer" ADD CONSTRAINT "BattlePlayer_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattlePlayer" ADD CONSTRAINT "BattlePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
