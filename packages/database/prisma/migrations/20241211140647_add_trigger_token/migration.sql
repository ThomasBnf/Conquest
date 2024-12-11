/*
  Warnings:

  - A unique constraint covering the columns `[trigger_token]` on the table `workspaces` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `members_preferences` to the `workspaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "members_preferences" JSONB NOT NULL,
ADD COLUMN     "trigger_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_trigger_token_key" ON "workspaces"("trigger_token");
