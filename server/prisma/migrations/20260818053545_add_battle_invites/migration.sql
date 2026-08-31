-- CreateEnum
CREATE TYPE "BattleInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "BattleInvite" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "variant" "SudokuVariant" NOT NULL,
    "status" "BattleInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "BattleInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BattleInvite_receiverId_status_idx" ON "BattleInvite"("receiverId", "status");

-- CreateIndex
CREATE INDEX "BattleInvite_senderId_status_idx" ON "BattleInvite"("senderId", "status");

-- CreateIndex
CREATE INDEX "BattleInvite_createdAt_idx" ON "BattleInvite"("createdAt");

-- AddForeignKey
ALTER TABLE "BattleInvite" ADD CONSTRAINT "BattleInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleInvite" ADD CONSTRAINT "BattleInvite_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
