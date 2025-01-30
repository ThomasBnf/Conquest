/*
  Warnings:

  - You are about to drop the column `gender` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "gender";

-- DropEnum
DROP TYPE "GENDER";
