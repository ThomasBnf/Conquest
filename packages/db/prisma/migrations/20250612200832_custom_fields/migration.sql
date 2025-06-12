/*
  Warnings:

  - You are about to drop the column `customFields` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the `UserInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RECORD" AS ENUM ('MEMBER', 'COMPANY');

-- CreateEnum
CREATE TYPE "TYPE" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTISELECT');

-- DropForeignKey
ALTER TABLE "UserInvitation" DROP CONSTRAINT "UserInvitation_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "customFields";

-- DropTable
DROP TABLE "UserInvitation";

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "TYPE" NOT NULL,
    "options" JSONB[],
    "record" "RECORD" NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invitation_workspaceId_idx" ON "Invitation"("workspaceId");

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
