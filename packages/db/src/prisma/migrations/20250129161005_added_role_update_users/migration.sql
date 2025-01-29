/*
  Warnings:

  - You are about to drop the column `external_id` on the `members` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('STAFF', 'ADMIN');

-- AlterTable
ALTER TABLE "members" DROP COLUMN "external_id";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_seen" TIMESTAMP(3),
ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'ADMIN';
