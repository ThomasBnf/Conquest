/*
  Warnings:

  - You are about to drop the column `created_at` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `duplicate` table. All the data in the column will be lost.
  - You are about to drop the column `member_ids` on the `duplicate` table. All the data in the column will be lost.
  - You are about to drop the column `total_pulse` on the `duplicate` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `duplicate` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `duplicate` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `ended_at` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `connected_at` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `run_id` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `trigger_token` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `integration` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `list` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `list` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `list` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `list` table. All the data in the column will be lost.
  - You are about to drop the column `author_id` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `companies_preferences` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_activity_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `members_preferences` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `userInWorkspace` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `userInWorkspace` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `userInWorkspace` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `userInWorkspace` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `userInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `userInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `userInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `last_run_at` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `company_size` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `is_past_due` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `price_id` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_customer_id` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `trial_end` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the `webhook` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `integration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId,workspaceId]` on the table `post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId,workspaceId]` on the table `tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workspaceId` to the `api_key` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `duplicate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `duplicate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggerToken` to the `integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `list` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `list` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `list` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastActivityAt` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `userInWorkspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `userInWorkspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `userInWorkspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `userInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `userInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `workflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `workflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `workspace` table without a default value. This is not possible if the table is not empty.

*/
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
DROP INDEX "api_key_workspace_id_idx";

-- DropIndex
DROP INDEX "duplicate_workspace_id_idx";

-- DropIndex
DROP INDEX "event_external_id_key";

-- DropIndex
DROP INDEX "event_id_workspace_id_idx";

-- DropIndex
DROP INDEX "event_source_workspace_id_idx";

-- DropIndex
DROP INDEX "integration_external_id_idx";

-- DropIndex
DROP INDEX "integration_external_id_key";

-- DropIndex
DROP INDEX "integration_id_workspace_id_idx";

-- DropIndex
DROP INDEX "list_created_by_workspace_id_idx";

-- DropIndex
DROP INDEX "list_id_workspace_id_idx";

-- DropIndex
DROP INDEX "post_external_id_workspace_id_idx";

-- DropIndex
DROP INDEX "post_external_id_workspace_id_key";

-- DropIndex
DROP INDEX "tag_external_id_workspace_id_key";

-- DropIndex
DROP INDEX "tag_id_workspace_id_idx";

-- DropIndex
DROP INDEX "tag_workspace_id_idx";

-- DropIndex
DROP INDEX "userInWorkspace_user_id_idx";

-- DropIndex
DROP INDEX "userInWorkspace_workspace_id_idx";

-- DropIndex
DROP INDEX "userInvitation_workspace_id_idx";

-- DropIndex
DROP INDEX "workflow_id_workspace_id_idx";

-- DropIndex
DROP INDEX "workflow_workspace_id_idx";

-- AlterTable
ALTER TABLE "api_key" DROP COLUMN "created_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "duplicate" DROP COLUMN "created_at",
DROP COLUMN "member_ids",
DROP COLUMN "total_pulse",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "memberIds" TEXT[],
ADD COLUMN     "totalPulse" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "event" DROP COLUMN "created_at",
DROP COLUMN "ended_at",
DROP COLUMN "external_id",
DROP COLUMN "started_at",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "integration" DROP COLUMN "connected_at",
DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "expires_at",
DROP COLUMN "external_id",
DROP COLUMN "run_id",
DROP COLUMN "trigger_token",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "connectedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "runId" TEXT,
ADD COLUMN     "triggerToken" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "list" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "post" DROP COLUMN "author_id",
DROP COLUMN "created_at",
DROP COLUMN "external_id",
DROP COLUMN "workspace_id",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "created_at",
DROP COLUMN "external_id",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "avatar_url",
DROP COLUMN "companies_preferences",
DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "last_activity_at",
DROP COLUMN "last_name",
DROP COLUMN "members_preferences",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "companiesPreferences" JSONB NOT NULL DEFAULT '{"id":"name","desc":false,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "membersPreferences" JSONB NOT NULL DEFAULT '{"id":"level","desc":true,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "userInWorkspace" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "userInvitation" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "workflow" DROP COLUMN "created_at",
DROP COLUMN "last_run_at",
DROP COLUMN "updated_at",
DROP COLUMN "workspace_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastRunAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "company_size",
DROP COLUMN "created_at",
DROP COLUMN "is_past_due",
DROP COLUMN "price_id",
DROP COLUMN "stripe_customer_id",
DROP COLUMN "trial_end",
DROP COLUMN "updated_at",
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPastDue" TIMESTAMP(3),
ADD COLUMN     "priceId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "trialEnd" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "webhook";

-- CreateIndex
CREATE INDEX "api_key_workspaceId_idx" ON "api_key"("workspaceId");

-- CreateIndex
CREATE INDEX "duplicate_workspaceId_idx" ON "duplicate"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "event_externalId_key" ON "event"("externalId");

-- CreateIndex
CREATE INDEX "event_id_workspaceId_idx" ON "event"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "event_source_workspaceId_idx" ON "event"("source", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_externalId_key" ON "integration"("externalId");

-- CreateIndex
CREATE INDEX "integration_id_workspaceId_idx" ON "integration"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "integration_externalId_idx" ON "integration"("externalId");

-- CreateIndex
CREATE INDEX "list_createdBy_workspaceId_idx" ON "list"("createdBy", "workspaceId");

-- CreateIndex
CREATE INDEX "list_id_workspaceId_idx" ON "list"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "post_externalId_workspaceId_idx" ON "post"("externalId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "post_externalId_workspaceId_key" ON "post"("externalId", "workspaceId");

-- CreateIndex
CREATE INDEX "tag_id_workspaceId_idx" ON "tag"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "tag_workspaceId_idx" ON "tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_externalId_workspaceId_key" ON "tag"("externalId", "workspaceId");

-- CreateIndex
CREATE INDEX "userInWorkspace_userId_idx" ON "userInWorkspace"("userId");

-- CreateIndex
CREATE INDEX "userInWorkspace_workspaceId_idx" ON "userInWorkspace"("workspaceId");

-- CreateIndex
CREATE INDEX "userInvitation_workspaceId_idx" ON "userInvitation"("workspaceId");

-- CreateIndex
CREATE INDEX "workflow_id_workspaceId_idx" ON "workflow"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "workflow_workspaceId_idx" ON "workflow"("workspaceId");

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicate" ADD CONSTRAINT "duplicate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration" ADD CONSTRAINT "integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list" ADD CONSTRAINT "list_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userInWorkspace" ADD CONSTRAINT "userInWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userInWorkspace" ADD CONSTRAINT "userInWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userInvitation" ADD CONSTRAINT "userInvitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
