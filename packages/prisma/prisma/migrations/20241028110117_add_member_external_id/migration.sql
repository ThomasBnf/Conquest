/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "external_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Activity_external_id_key" ON "Activity"("external_id");
