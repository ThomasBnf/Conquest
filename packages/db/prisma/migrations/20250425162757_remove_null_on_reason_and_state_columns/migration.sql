/*
  Warnings:

  - Made the column `reason` on table `Duplicate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Duplicate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Duplicate" ALTER COLUMN "reason" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL;
