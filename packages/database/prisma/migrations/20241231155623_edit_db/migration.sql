/*
  Warnings:

  - You are about to drop the column `bio` on the `members` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "members_id_workspace_id_idx";

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "event_id" TEXT;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "bio",
ALTER COLUMN "primary_email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
