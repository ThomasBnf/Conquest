-- CreateEnum
CREATE TYPE "SOURCE" AS ENUM ('API', 'DISCOURSE', 'DISCORD', 'GITHUB', 'LINKEDIN', 'LIVESTORM', 'MANUAL', 'SLACK');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ENABLED', 'CONNECTED', 'SYNCING', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "PLAN" AS ENUM ('BASIC', 'PREMIUM', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('STAFF', 'ADMIN');

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "title" TEXT,
    "message" TEXT NOT NULL,
    "reply_to" TEXT,
    "react_to" TEXT,
    "invite_to" TEXT,
    "source" "SOURCE" NOT NULL,
    "activity_type_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "event_id" TEXT,
    "member_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "SOURCE" NOT NULL,
    "key" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "conditions" JSONB[],
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "source" "SOURCE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
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

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "source" "SOURCE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "connected_at" TIMESTAMP(3),
    "status" "STATUS" NOT NULL,
    "details" JSONB NOT NULL,
    "trigger_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupFilters" JSONB NOT NULL DEFAULT '{"filters":[],"operator":"AND"}',
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "primary_email" TEXT,
    "secondary_emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "job_title" TEXT,
    "avatar_url" TEXT,
    "country" TEXT,
    "language" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pulse" INTEGER NOT NULL DEFAULT 0,
    "source" "SOURCE" NOT NULL,
    "logs" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "level_id" TEXT,
    "linkedin_url" TEXT,
    "company_id" TEXT,
    "workspace_id" TEXT NOT NULL,
    "first_activity" TIMESTAMP(3),
    "last_activity" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "attributes" JSONB,
    "member_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "source" "SOURCE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "onboarding" TIMESTAMP(3),
    "role" "ROLE" NOT NULL DEFAULT 'ADMIN',
    "last_seen" TIMESTAMP(3),
    "members_preferences" JSONB NOT NULL DEFAULT '{"id":"full_name","desc":true,"pageSize":50,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
    "companies_preferences" JSONB NOT NULL DEFAULT '{"id":"name","desc":true,"pageSize":50,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
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

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source" TEXT,
    "company_size" TEXT,
    "plan" "PLAN" NOT NULL DEFAULT 'BASIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_external_id_workspace_id_idx" ON "activity"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "activity_workspace_id_idx" ON "activity"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_external_id_workspace_id_key" ON "activity"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "activity_type_key_workspace_id_idx" ON "activity_type"("key", "workspace_id");

-- CreateIndex
CREATE INDEX "activity_type_workspace_id_idx" ON "activity_type"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_type_key_workspace_id_key" ON "activity_type"("key", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_token_key" ON "api_key"("token");

-- CreateIndex
CREATE INDEX "api_key_id_idx" ON "api_key"("id");

-- CreateIndex
CREATE INDEX "api_key_workspace_id_idx" ON "api_key"("workspace_id");

-- CreateIndex
CREATE INDEX "channel_external_id_workspace_id_idx" ON "channel"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "channel_workspace_id_idx" ON "channel"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "channel_external_id_workspace_id_key" ON "channel"("external_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_domain_key" ON "company"("domain");

-- CreateIndex
CREATE INDEX "company_id_workspace_id_idx" ON "company"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "company_workspace_id_idx" ON "company"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_external_id_key" ON "event"("external_id");

-- CreateIndex
CREATE INDEX "event_id_workspace_id_idx" ON "event"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "event_source_workspace_id_idx" ON "event"("source", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_external_id_key" ON "integration"("external_id");

-- CreateIndex
CREATE INDEX "integration_id_workspace_id_idx" ON "integration"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "integration_external_id_idx" ON "integration"("external_id");

-- CreateIndex
CREATE INDEX "list_id_workspace_id_idx" ON "list"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "member_id_idx" ON "member"("id");

-- CreateIndex
CREATE INDEX "member_primary_email_workspace_id_idx" ON "member"("primary_email", "workspace_id");

-- CreateIndex
CREATE INDEX "post_external_id_workspace_id_idx" ON "post"("external_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_external_id_workspace_id_key" ON "post"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "profile_external_id_workspace_id_idx" ON "profile"("external_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_external_id_workspace_id_key" ON "profile"("external_id", "workspace_id");

-- CreateIndex
CREATE INDEX "tag_id_workspace_id_idx" ON "tag"("id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_external_id_workspace_id_key" ON "tag"("external_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "user"("id");

-- CreateIndex
CREATE INDEX "webhook_id_workspace_id_idx" ON "webhook"("id", "workspace_id");

-- CreateIndex
CREATE INDEX "webhook_workspace_id_idx" ON "webhook"("workspace_id");

-- CreateIndex
CREATE INDEX "workflow_id_workspace_id_idx" ON "workflow"("id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace"("slug");

-- CreateIndex
CREATE INDEX "workspace_id_idx" ON "workspace"("id");

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_activity_type_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "activity_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_type" ADD CONSTRAINT "activity_type_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel" ADD CONSTRAINT "channel_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration" ADD CONSTRAINT "integration_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list" ADD CONSTRAINT "list_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
