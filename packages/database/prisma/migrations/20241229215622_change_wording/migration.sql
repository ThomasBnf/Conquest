/*
  Warnings:

  - You are about to drop the column `invite_by` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `installed_at` on the `integrations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[linkedin_id,workspace_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[livestorm_id,workspace_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "activities" DROP COLUMN "invite_by",
ADD COLUMN     "invite_to" TEXT;

-- AlterTable
ALTER TABLE "integrations" DROP COLUMN "installed_at",
ADD COLUMN     "connected_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "linkedin_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "members_linkedin_id_workspace_id_key" ON "members"("linkedin_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_livestorm_id_workspace_id_key" ON "members"("livestorm_id", "workspace_id");
