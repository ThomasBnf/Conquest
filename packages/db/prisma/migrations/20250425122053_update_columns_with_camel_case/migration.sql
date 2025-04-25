/*
  Warnings:

  - You are about to drop the column `created_at` on the `userInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `userInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `userInvitation` table. All the data in the column will be lost.
  - You are about to drop the `api_key` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `duplicate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `list` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userInWorkspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspace` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `userInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `userInvitation` table without a default value. This is not possible if the table is not empty.

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

-- DropIndex
DROP INDEX "userInvitation_workspace_id_idx";

-- AlterTable
ALTER TABLE "userInvitation" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

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
DROP TABLE "tag";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "userInWorkspace";

-- DropTable
DROP TABLE "webhook";

-- DropTable
DROP TABLE "workflow";

-- DropTable
DROP TABLE "workspace";

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duplicate" (
    "id" TEXT NOT NULL,
    "memberIds" TEXT[],
    "reason" "REASON" NOT NULL,
    "state" "STATE" NOT NULL,
    "totalPulse" INTEGER NOT NULL DEFAULT 0,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Duplicate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "source" "SOURCE" NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "connectedAt" TIMESTAMP(3),
    "status" "STATUS" NOT NULL,
    "details" JSONB NOT NULL,
    "triggerToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "runId" TEXT,
    "createdBy" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupFilters" JSONB NOT NULL DEFAULT '{"filters":[],"operator":"AND"}',
    "createdBy" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "source" "SOURCE" NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "onboarding" TIMESTAMP(3),
    "role" "ROLE" NOT NULL DEFAULT 'ADMIN',
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "membersPreferences" JSONB NOT NULL DEFAULT '{"id":"level","desc":true,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
    "companiesPreferences" JSONB NOT NULL DEFAULT '{"id":"name","desc":false,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInWorkspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB[],
    "edges" JSONB[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source" TEXT,
    "companySize" TEXT,
    "plan" "PLAN",
    "stripeCustomerId" TEXT,
    "priceId" TEXT,
    "trialEnd" TIMESTAMP(3),
    "isPastDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_token_key" ON "ApiKey"("token");

-- CreateIndex
CREATE INDEX "ApiKey_id_idx" ON "ApiKey"("id");

-- CreateIndex
CREATE INDEX "ApiKey_workspaceId_idx" ON "ApiKey"("workspaceId");

-- CreateIndex
CREATE INDEX "Duplicate_workspaceId_idx" ON "Duplicate"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_externalId_key" ON "Event"("externalId");

-- CreateIndex
CREATE INDEX "Event_id_workspaceId_idx" ON "Event"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Event_source_workspaceId_idx" ON "Event"("source", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_externalId_key" ON "Integration"("externalId");

-- CreateIndex
CREATE INDEX "Integration_id_workspaceId_idx" ON "Integration"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Integration_externalId_idx" ON "Integration"("externalId");

-- CreateIndex
CREATE INDEX "List_createdBy_workspaceId_idx" ON "List"("createdBy", "workspaceId");

-- CreateIndex
CREATE INDEX "List_id_workspaceId_idx" ON "List"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Post_externalId_workspaceId_idx" ON "Post"("externalId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_externalId_workspaceId_key" ON "Post"("externalId", "workspaceId");

-- CreateIndex
CREATE INDEX "Tag_id_workspaceId_idx" ON "Tag"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Tag_workspaceId_idx" ON "Tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_externalId_workspaceId_key" ON "Tag"("externalId", "workspaceId");

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
CREATE INDEX "Workflow_id_workspaceId_idx" ON "Workflow"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Workflow_workspaceId_idx" ON "Workflow"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_id_idx" ON "Workspace"("id");

-- CreateIndex
CREATE INDEX "userInvitation_workspaceId_idx" ON "userInvitation"("workspaceId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duplicate" ADD CONSTRAINT "Duplicate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInWorkspace" ADD CONSTRAINT "UserInWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInWorkspace" ADD CONSTRAINT "UserInWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userInvitation" ADD CONSTRAINT "userInvitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
