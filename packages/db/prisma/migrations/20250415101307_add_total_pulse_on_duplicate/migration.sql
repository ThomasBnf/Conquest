/*
  Warnings:

  - You are about to drop the column `last_duplicates_checked_at` on the `workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "duplicate" ADD COLUMN     "total_pulse" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "last_duplicates_checked_at";
