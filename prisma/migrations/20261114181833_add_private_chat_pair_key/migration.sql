/*
  Warnings:

  - A unique constraint covering the columns `[private_pair_key]` on the table `chats` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "private_pair_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chats_private_pair_key_key" ON "chats"("private_pair_key");
