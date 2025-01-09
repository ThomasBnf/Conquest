-- CreateEnum
CREATE TYPE "PLAN" AS ENUM ('BASIC', 'PREMIUM', 'BUSINESS', 'ENTERPRISE');

-- DropIndex
DROP INDEX "activities_id_workspace_id_idx";

-- DropIndex
DROP INDEX "activities_types_id_workspace_id_idx";

-- DropIndex
DROP INDEX "apikeys_id_token_idx";

-- DropIndex
DROP INDEX "channels_id_workspace_id_idx";

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "plan" "PLAN" NOT NULL DEFAULT 'BASIC';

-- CreateIndex
CREATE INDEX "activities_external_id_workspace_id_idx" ON "activities"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "activities_workspace_id_idx" ON "activities"("workspace_id");

-- CreateIndex
CREATE INDEX "activities_types_key_workspace_id_idx" ON "activities_types"("key", "workspace_id");

-- CreateIndex
CREATE INDEX "activities_types_workspace_id_idx" ON "activities_types"("workspace_id");

-- CreateIndex
CREATE INDEX "apikeys_id_idx" ON "apikeys"("id");

-- CreateIndex
CREATE INDEX "apikeys_workspace_id_idx" ON "apikeys"("workspace_id");

-- CreateIndex
CREATE INDEX "channels_external_id_workspace_id_idx" ON "channels"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "channels_workspace_id_idx" ON "channels"("workspace_id");

-- CreateIndex
CREATE INDEX "companies_workspace_id_idx" ON "companies"("workspace_id");

-- CreateIndex
CREATE INDEX "events_source_workspace_id_idx" ON "events"("source", "workspace_id");

-- CreateIndex
CREATE INDEX "integrations_external_id_idx" ON "integrations"("external_id");

-- CreateIndex
CREATE INDEX "members_id_workspace_id_idx" ON "members"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "members_primary_email_workspace_id_idx" ON "members"("primary_email", "workspace_id");

-- CreateIndex
CREATE INDEX "members_username_workspace_id_idx" ON "members"("username", "workspace_id");

-- CreateIndex
CREATE INDEX "members_discord_id_workspace_id_idx" ON "members"("discord_id", "workspace_id");

-- CreateIndex
CREATE INDEX "members_discourse_id_workspace_id_idx" ON "members"("discourse_id", "workspace_id");

-- CreateIndex
CREATE INDEX "members_linkedin_id_workspace_id_idx" ON "members"("linkedin_id", "workspace_id");

-- CreateIndex
CREATE INDEX "members_livestorm_id_workspace_id_idx" ON "members"("livestorm_id", "workspace_id");

-- CreateIndex
CREATE INDEX "members_slack_id_workspace_id_idx" ON "members"("slack_id", "workspace_id");
