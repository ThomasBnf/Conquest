/*
  Warnings:

  - You are about to drop the column `trigger_token` on the `workspaces` table. All the data in the column will be lost.
  - Added the required column `trigger_token` to the `integrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger_token_expires_at` to the `integrations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "workspaces_trigger_token_key";

-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "trigger_token" TEXT NOT NULL,
ADD COLUMN     "trigger_token_expires_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "level_logs" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "love_logs" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "presence_logs" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "trigger_token";
