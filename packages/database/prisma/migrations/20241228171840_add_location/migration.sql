/*
  Warnings:

  - You are about to drop the column `locale` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "locale",
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "full_name";
