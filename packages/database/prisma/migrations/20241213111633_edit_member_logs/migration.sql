/*
  Warnings:

  - You are about to drop the column `level_logs` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `love_logs` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `presence_logs` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "level_logs",
DROP COLUMN "love_logs",
DROP COLUMN "presence_logs",
ADD COLUMN     "logs" JSONB[] DEFAULT ARRAY[]::JSONB[];
