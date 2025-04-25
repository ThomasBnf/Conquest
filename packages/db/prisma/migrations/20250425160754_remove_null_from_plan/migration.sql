/*
  Warnings:

  - Made the column `plan` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "plan" SET NOT NULL;
