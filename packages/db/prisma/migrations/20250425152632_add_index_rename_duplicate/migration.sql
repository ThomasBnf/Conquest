/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan` column on the `Workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `VerificationTokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `api_key` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `duplicate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `list` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userInWorkspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userInvitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspace` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `source` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Integration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `source` on the `Tag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "api_key" DROP CONSTRAINT "api_key_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "duplicate" DROP CONSTRAINT "duplicate_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "integration" DROP CONSTRAINT "integration_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "list" DROP CONSTRAINT "list_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "userInWorkspace" DROP CONSTRAINT "userInWorkspace_user_id_fkey";

-- DropForeignKey
ALTER TABLE "userInWorkspace" DROP CONSTRAINT "userInWorkspace_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "userInvitation" DROP CONSTRAINT "userInvitation_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "webhook" DROP CONSTRAINT "webhook_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow" DROP CONSTRAINT "workflow_workspace_id_fkey";

-- AlterTable
ALTER TABLE "ApiKey" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Duplicate" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "endedAt" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "source",
ADD COLUMN     "source" "SOURCE" NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Integration" ALTER COLUMN "connectedAt" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "STATUS" NOT NULL,
ALTER COLUMN "details" SET DATA TYPE JSONB,
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "List" ALTER COLUMN "groupFilters" SET DATA TYPE JSONB,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expires" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "source",
ADD COLUMN     "source" "SOURCE" NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_verified" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "onboarding" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "role",
ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'ADMIN',
ALTER COLUMN "lastActivityAt" DROP DEFAULT,
ALTER COLUMN "lastActivityAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "membersPreferences" SET DATA TYPE JSONB,
ALTER COLUMN "companiesPreferences" SET DATA TYPE JSONB,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserInWorkspace" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserInvitation" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Workflow" ALTER COLUMN "nodes" SET DATA TYPE JSONB[],
ALTER COLUMN "edges" SET DATA TYPE JSONB[],
ALTER COLUMN "lastRunAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "plan",
ADD COLUMN     "plan" "PLAN",
ALTER COLUMN "trialEnd" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "isPastDue" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "VerificationTokens";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "api_key";

-- DropTable
DROP TABLE "duplicate";

-- DropTable
DROP TABLE "event";

-- DropTable
DROP TABLE "integration";

-- DropTable
DROP TABLE "list";

-- DropTable
DROP TABLE "post";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "tag";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "userInWorkspace";

-- DropTable
DROP TABLE "userInvitation";

-- DropTable
DROP TABLE "verification_tokens";

-- DropTable
DROP TABLE "webhook";

-- DropTable
DROP TABLE "workflow";

-- DropTable
DROP TABLE "workspace";

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ApiKey_id_idx" ON "ApiKey"("id");

-- CreateIndex
CREATE INDEX "ApiKey_workspaceId_idx" ON "ApiKey"("workspaceId");

-- CreateIndex
CREATE INDEX "Duplicate_workspaceId_idx" ON "Duplicate"("workspaceId");

-- CreateIndex
CREATE INDEX "Event_id_workspaceId_idx" ON "Event"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Event_source_workspaceId_idx" ON "Event"("source", "workspaceId");

-- CreateIndex
CREATE INDEX "Integration_id_workspaceId_idx" ON "Integration"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Integration_externalId_idx" ON "Integration"("externalId");

-- CreateIndex
CREATE INDEX "List_createdBy_workspaceId_idx" ON "List"("createdBy", "workspaceId");

-- CreateIndex
CREATE INDEX "List_id_workspaceId_idx" ON "List"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Tag_id_workspaceId_idx" ON "Tag"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Tag_workspaceId_idx" ON "Tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserInWorkspace_userId_idx" ON "UserInWorkspace"("userId");

-- CreateIndex
CREATE INDEX "UserInWorkspace_workspaceId_idx" ON "UserInWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "UserInvitation_workspaceId_idx" ON "UserInvitation"("workspaceId");

-- CreateIndex
CREATE INDEX "Workflow_id_workspaceId_idx" ON "Workflow"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Workflow_workspaceId_idx" ON "Workflow"("workspaceId");

-- CreateIndex
CREATE INDEX "Workspace_id_idx" ON "Workspace"("id");

-- RenameForeignKey
ALTER TABLE "Account" RENAME CONSTRAINT "accounts_user_id_fkey" TO "Account_userId_fkey";

-- RenameForeignKey
ALTER TABLE "ApiKey" RENAME CONSTRAINT "api_key_workspace_id_fkey" TO "ApiKey_workspaceId_fkey";

-- RenameForeignKey
ALTER TABLE "Event" RENAME CONSTRAINT "event_workspace_id_fkey" TO "Event_workspaceId_fkey";

-- RenameForeignKey
ALTER TABLE "Integration" RENAME CONSTRAINT "integration_workspace_id_fkey" TO "Integration_workspaceId_fkey";

-- RenameForeignKey
ALTER TABLE "List" RENAME CONSTRAINT "list_workspace_id_fkey" TO "List_workspaceId_fkey";

-- RenameForeignKey
ALTER TABLE "Session" RENAME CONSTRAINT "sessions_user_id_fkey" TO "Session_userId_fkey";

-- RenameForeignKey
ALTER TABLE "Tag" RENAME CONSTRAINT "tag_workspace_id_fkey" TO "Tag_workspaceId_fkey";

-- RenameForeignKey
ALTER TABLE "User" RENAME CONSTRAINT "user_workspace_id_fkey" TO "User_workspaceId_fkey";

-- RenameForeignKey
ALTER TABLE "Workflow" RENAME CONSTRAINT "workflow_workspace_id_fkey" TO "Workflow_workspaceId_fkey";

-- AddForeignKey
ALTER TABLE "Duplicate" ADD CONSTRAINT "Duplicate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInWorkspace" ADD CONSTRAINT "UserInWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInWorkspace" ADD CONSTRAINT "UserInWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Account_provider_provider_account_id_key" RENAME TO "Account_provider_providerAccountId_key";

-- RenameIndex
ALTER INDEX "Event_external_id_key" RENAME TO "Event_externalId_key";

-- RenameIndex
ALTER INDEX "Integration_external_id_key" RENAME TO "Integration_externalId_key";

-- RenameIndex
ALTER INDEX "Session_session_token_key" RENAME TO "Session_sessionToken_key";

-- RenameIndex
ALTER INDEX "Tag_external_id_workspace_id_key" RENAME TO "Tag_externalId_workspaceId_key";
