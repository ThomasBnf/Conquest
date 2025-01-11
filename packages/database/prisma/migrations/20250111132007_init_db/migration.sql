-- CreateEnum
CREATE TYPE "SOURCE" AS ENUM ('API', 'BREVO', 'DISCOURSE', 'DISCORD', 'GITHUB', 'HUBSPOT', 'LINKEDIN', 'LIVESTORM', 'MANUAL', 'SLACK', 'X', 'YOUTUBE', 'ZENDESK');

-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ENABLED', 'CONNECTED', 'SYNCING', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "PLAN" AS ENUM ('BASIC', 'PREMIUM', 'BUSINESS', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "title" TEXT,
    "message" TEXT NOT NULL,
    "thread_id" TEXT,
    "reply_to" TEXT,
    "react_to" TEXT,
    "invite_to" TEXT,
    "activity_type_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "event_id" TEXT,
    "member_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "SOURCE" NOT NULL,
    "key" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apikeys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apikeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "source" "SOURCE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "address" TEXT,
    "domain" TEXT,
    "employees" INTEGER,
    "founded_at" TIMESTAMP(3),
    "logo_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" "SOURCE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "source" "SOURCE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "connected_at" TIMESTAMP(3),
    "status" "STATUS" NOT NULL,
    "details" JSONB NOT NULL,
    "trigger_token" TEXT NOT NULL,
    "trigger_token_expires_at" TIMESTAMP(3) NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "discord_id" TEXT,
    "discourse_id" TEXT,
    "linkedin_id" TEXT,
    "livestorm_id" TEXT,
    "slack_id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "username" TEXT,
    "location" TEXT,
    "avatar_url" TEXT,
    "job_title" TEXT,
    "primary_email" TEXT,
    "secondary_emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "level" INTEGER NOT NULL DEFAULT 0,
    "pulse" INTEGER NOT NULL DEFAULT 0,
    "presence" INTEGER NOT NULL DEFAULT 0,
    "gender" "GENDER",
    "source" "SOURCE" NOT NULL,
    "logs" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "company_id" TEXT,
    "workspace_id" TEXT NOT NULL,
    "first_activity" TIMESTAMP(3),
    "last_activity" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "source" "SOURCE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "onboarding" TIMESTAMP(3),
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB[],
    "edges" JSONB[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "last_run_at" TIMESTAMP(3),
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source" TEXT,
    "company_size" TEXT,
    "members_preferences" JSONB NOT NULL,
    "plan" "PLAN" NOT NULL DEFAULT 'BASIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_external_id_workspace_id_idx" ON "activities"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "activities_workspace_id_idx" ON "activities"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_external_id_workspace_id_key" ON "activities"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "activities_types_key_workspace_id_idx" ON "activities_types"("key", "workspace_id");

-- CreateIndex
CREATE INDEX "activities_types_workspace_id_idx" ON "activities_types"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_types_key_workspace_id_key" ON "activities_types"("key", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "apikeys_token_key" ON "apikeys"("token");

-- CreateIndex
CREATE INDEX "apikeys_id_idx" ON "apikeys"("id");

-- CreateIndex
CREATE INDEX "apikeys_workspace_id_idx" ON "apikeys"("workspace_id");

-- CreateIndex
CREATE INDEX "channels_external_id_workspace_id_idx" ON "channels"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "channels_workspace_id_idx" ON "channels"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "channels_external_id_workspace_id_key" ON "channels"("external_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_domain_key" ON "companies"("domain");

-- CreateIndex
CREATE INDEX "companies_id_workspace_id_idx" ON "companies"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "companies_workspace_id_idx" ON "companies"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_external_id_key" ON "events"("external_id");

-- CreateIndex
CREATE INDEX "events_id_workspace_id_idx" ON "events"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "events_source_workspace_id_idx" ON "events"("source", "workspace_id");

-- CreateIndex
CREATE INDEX "files_activity_id_idx" ON "files"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_external_id_key" ON "integrations"("external_id");

-- CreateIndex
CREATE INDEX "integrations_id_workspace_id_idx" ON "integrations"("id", "workspace_id");

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

-- CreateIndex
CREATE UNIQUE INDEX "members_primary_email_workspace_id_key" ON "members"("primary_email", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_username_workspace_id_key" ON "members"("username", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_discord_id_workspace_id_key" ON "members"("discord_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_discourse_id_workspace_id_key" ON "members"("discourse_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_linkedin_id_workspace_id_key" ON "members"("linkedin_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_livestorm_id_workspace_id_key" ON "members"("livestorm_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_slack_id_workspace_id_key" ON "members"("slack_id", "workspace_id");

-- CreateIndex
CREATE INDEX "tags_id_workspace_id_idx" ON "tags"("id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_external_id_workspace_id_key" ON "tags"("external_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- CreateIndex
CREATE INDEX "workflows_id_workspace_id_idx" ON "workflows"("id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspaces_id_idx" ON "workspaces"("id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_activity_type_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "activities_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities_types" ADD CONSTRAINT "activities_types_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apikeys" ADD CONSTRAINT "apikeys_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
