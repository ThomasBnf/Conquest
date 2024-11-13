/*
  Warnings:

  - You are about to drop the column `name` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `scopes` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `slack_user_token` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Integration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "name",
DROP COLUMN "scopes",
DROP COLUMN "slack_user_token",
DROP COLUMN "source",
DROP COLUMN "token",
ADD COLUMN     "details" JSONB;
