/*
  Warnings:

  - The `reason` column on the `Duplicate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `state` column on the `Duplicate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Integration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `Workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `source` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Duplicate" DROP COLUMN "reason",
ADD COLUMN     "reason" "REASON",
DROP COLUMN "state",
ADD COLUMN     "state" "STATE";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "source",
ADD COLUMN     "source" "SOURCE" NOT NULL;

-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "status",
ADD COLUMN     "status" "STATUS";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "plan",
ADD COLUMN     "plan" "PLAN" DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Event_source_workspaceId_idx" ON "Event"("source", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
