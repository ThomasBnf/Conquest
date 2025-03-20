/*
  Warnings:

  - The `is_past_due` column on the `workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "is_past_due",
ADD COLUMN     "is_past_due" TIMESTAMP(3);
