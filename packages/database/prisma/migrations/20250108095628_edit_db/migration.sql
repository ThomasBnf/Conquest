/*
  Warnings:

  - You are about to drop the column `description` on the `tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discord_id,workspace_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "SOURCE" ADD VALUE 'DISCORD';

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "discord_id" TEXT;

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "description";

-- CreateIndex
CREATE UNIQUE INDEX "members_discord_id_workspace_id_key" ON "members"("discord_id", "workspace_id");
