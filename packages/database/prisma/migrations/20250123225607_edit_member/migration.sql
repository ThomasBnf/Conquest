/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discourse_username,workspace_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[discord_username,workspace_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "members_id_workspace_id_idx";

-- DropIndex
DROP INDEX "members_primary_email_workspace_id_key";

-- DropIndex
DROP INDEX "members_username_workspace_id_idx";

-- DropIndex
DROP INDEX "members_username_workspace_id_key";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "deleted_at",
DROP COLUMN "username",
ADD COLUMN     "discord_username" TEXT,
ADD COLUMN     "discourse_username" TEXT;

-- CreateIndex
CREATE INDEX "members_id_idx" ON "members"("id");

-- CreateIndex
CREATE INDEX "members_discourse_username_workspace_id_idx" ON "members"("discourse_username", "workspace_id");

-- CreateIndex
CREATE INDEX "members_discord_username_workspace_id_idx" ON "members"("discord_username", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_discourse_username_workspace_id_key" ON "members"("discourse_username", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_discord_username_workspace_id_key" ON "members"("discord_username", "workspace_id");
