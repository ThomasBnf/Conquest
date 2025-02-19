/*
  Warnings:

  - You are about to drop the column `trigger_token_expires_at` on the `integration` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `integration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "integration" DROP COLUMN "trigger_token_expires_at",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;
