/*
  Warnings:

  - You are about to drop the column `icon` on the `Workflow` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "icon",
DROP COLUMN "isPublished",
ADD COLUMN     "last_run_at" TIMESTAMP(3),
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
