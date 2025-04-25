/*
  Warnings:

  - The `reason` column on the `Duplicate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `state` column on the `Duplicate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Integration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `Workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Duplicate" DROP COLUMN "reason",
ADD COLUMN     "reason" "REASON",
DROP COLUMN "state",
ADD COLUMN     "state" "STATE";

-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "status",
ADD COLUMN     "status" "STATUS";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "plan",
ADD COLUMN     "plan" "PLAN" NOT NULL DEFAULT 'ACTIVE';
