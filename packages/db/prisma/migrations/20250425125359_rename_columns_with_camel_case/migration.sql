CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY DEFAULT cuid(),
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,

  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
);

INSERT INTO "Account" (
  "id",
  "userId",
  "type",
  "provider",
  "providerAccountId",
  "refresh_token",
  "access_token",
  "expires_at",
  "token_type",
  "scope",
  "id_token",
  "session_state"
)
SELECT
  "id",
  "userId",
  "type",
  "provider",
  "providerAccountId",
  "refresh_token",
  "access_token",
  "expires_at",
  "token_type",
  "scope",
  "id_token",
  "session_state"
FROM "account";

ALTER TABLE "account" RENAME TO "account_old";

CREATE TABLE "ApiKey" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "ApiKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "ApiKey_id_idx" ON "ApiKey" ("id");
CREATE INDEX "ApiKey_workspaceId_idx" ON "ApiKey" ("workspaceId");

INSERT INTO "ApiKey" ("id", "name", "token", "workspaceId", "createdAt")
SELECT "id", "name", "token", "workspace_id", "created_at"
FROM "api_key";

ALTER TABLE "api_key" RENAME TO "api_key_old";

CREATE TABLE "Duplicate" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "memberIds" TEXT[] NOT NULL,
  "reason" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "totalPulse" INTEGER NOT NULL DEFAULT 0,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "Duplicate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "Duplicate_workspaceId_idx" ON "Duplicate" ("workspaceId");

INSERT INTO "Duplicate" (
  "id", "memberIds", "reason", "state", "totalPulse", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "member_ids", "reason", "state", "total_pulse", "workspace_id", "created_at", "updated_at"
FROM "duplicate";

ALTER TABLE "duplicate" RENAME TO "duplicate_old";

CREATE TABLE "Event" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "externalId" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ NOT NULL,
  "endedAt" TIMESTAMPTZ,
  "source" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "Event_id_workspaceId_idx" ON "Event" ("id", "workspaceId");
CREATE INDEX "Event_source_workspaceId_idx" ON "Event" ("source", "workspaceId");

INSERT INTO "Event" (
  "id", "externalId", "title", "startedAt", "endedAt", "source", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "external_id", "title", "started_at", "ended_at", "source", "workspace_id", "created_at", "updated_at"
FROM "event";

ALTER TABLE "event" RENAME TO "event_old";

CREATE TABLE "Integration" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "externalId" TEXT UNIQUE,
  "connectedAt" TIMESTAMPTZ,
  "status" TEXT NOT NULL,
  "details" JSON NOT NULL,
  "triggerToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "runId" TEXT,
  "createdBy" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "Integration_id_workspaceId_idx" ON "Integration" ("id", "workspaceId");
CREATE INDEX "Integration_externalId_idx" ON "Integration" ("externalId");

INSERT INTO "Integration" (
  "id", "externalId", "connectedAt", "status", "details", "triggerToken", "expiresAt", "runId", "createdBy", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "external_id", "connected_at", "status", "details", "trigger_token", "expires_at", "run_id", "created_by", "workspace_id", "created_at", "updated_at"
FROM "integration";

ALTER TABLE "integration" RENAME TO "integration_old";

CREATE TABLE "List" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "emoji" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "groupFilters" JSON NOT NULL DEFAULT '{"filters":[],"operator":"AND"}',
  "createdBy" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "List_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "List_createdBy_workspaceId_idx" ON "List" ("createdBy", "workspaceId");
CREATE INDEX "List_id_workspaceId_idx" ON "List" ("id", "workspaceId");

INSERT INTO "List" (
  "id", "emoji", "name", "groupFilters", "createdBy", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "emoji", "name", "group_filters", "created_by", "workspace_id", "created_at", "updated_at"
FROM "list";

ALTER TABLE "list" RENAME TO "list_old";

CREATE TABLE "Post" (
  "id" TEXT PRIMARY KEY DEFAULT cuid(),
  "externalId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Post_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE,
  CONSTRAINT "Post_externalId_workspaceId_key" UNIQUE ("externalId", "workspaceId")
);

CREATE INDEX "Post_externalId_workspaceId_idx" ON "Post" ("externalId", "workspaceId");

INSERT INTO "Post" (
  "id", "externalId", "content", "authorId", "workspaceId", "createdAt"
)
SELECT
  "id", "external_id", "content", "author_id", "workspace_id", "created_at"
FROM "post";

ALTER TABLE "post" RENAME TO "post_old";

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY DEFAULT cuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

INSERT INTO "Session" (
  "id", "sessionToken", "userId", "expires"
)
SELECT
  "id", "session_token", "user_id", "expires"
FROM "session";

ALTER TABLE "session" RENAME TO "session_old";

CREATE TABLE "Tag" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "externalId" TEXT,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE,
  CONSTRAINT "Tag_externalId_workspaceId_key" UNIQUE ("externalId", "workspaceId")
);

CREATE INDEX "Tag_id_workspaceId_idx" ON "Tag" ("id", "workspaceId");
CREATE INDEX "Tag_workspaceId_idx" ON "Tag" ("workspaceId");

INSERT INTO "Tag" (
  "id", "externalId", "name", "color", "source", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "external_id", "name", "color", "source", "workspace_id", "created_at", "updated_at"
FROM "tag";

ALTER TABLE "tag" RENAME TO "tag_old";

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT cuid(),
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" TIMESTAMPTZ,
  "firstName" TEXT,
  "lastName" TEXT,
  "avatarUrl" TEXT,
  "onboarding" TIMESTAMPTZ,
  "role" TEXT NOT NULL DEFAULT 'ADMIN',
  "lastActivityAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "membersPreferences" JSON NOT NULL DEFAULT '{"id":"level","desc":true,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
  "companiesPreferences" JSON NOT NULL DEFAULT '{"id":"name","desc":false,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "User_id_idx" ON "User" ("id");
CREATE INDEX "User_email_idx" ON "User" ("email");

INSERT INTO "User" (
  "id", "email", "email_verified", "firstName", "lastName", "avatarUrl", "onboarding", "role", "lastActivityAt",
  "membersPreferences", "companiesPreferences", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "email", "email_verified", "first_name", "last_name", "avatar_url", "onboarding", "role", "last_activity_at",
  "members_preferences", "companies_preferences", "workspace_id", "created_at", "updated_at"
FROM "user";

ALTER TABLE "user" RENAME TO "user_old";

CREATE TABLE "UserInWorkspace" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "UserInWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "UserInWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "UserInWorkspace_userId_idx" ON "UserInWorkspace" ("userId");
CREATE INDEX "UserInWorkspace_workspaceId_idx" ON "UserInWorkspace" ("workspaceId");

INSERT INTO "UserInWorkspace" (
  "id", "userId", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "user_id", "workspace_id", "created_at", "updated_at"
FROM "user_in_workspace";

ALTER TABLE "user_in_workspace" RENAME TO "user_in_workspace_old";

CREATE TABLE "UserInvitation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "UserInvitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "UserInvitation_workspaceId_idx" ON "UserInvitation" ("workspaceId");

INSERT INTO "UserInvitation" (
  "id", "email", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "email", "workspace_id", "created_at", "updated_at"
FROM "user_invitation";

ALTER TABLE "user_invitation" RENAME TO "user_invitation_old";

CREATE TABLE "VerificationToken" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);

INSERT INTO "VerificationToken" (
  "id", "identifier", "token", "expires"
)
SELECT
  "id", "identifier", "token", "expires"
FROM "verification_token";

ALTER TABLE "verification_token" RENAME TO "verification_token_old";

CREATE TABLE "Workflow" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "nodes" JSON[] NOT NULL,
  "edges" JSON[] NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "lastRunAt" TIMESTAMPTZ,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Workflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE
);

CREATE INDEX "Workflow_id_workspaceId_idx" ON "Workflow" ("id", "workspaceId");
CREATE INDEX "Workflow_workspaceId_idx" ON "Workflow" ("workspaceId");

INSERT INTO "Workflow" (
  "id", "name", "description", "nodes", "edges", "published", "lastRunAt", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "name", "description", "nodes", "edges", "published", "last_run_at", "workspace_id", "created_at", "updated_at"
FROM "workflow";

ALTER TABLE "workflow" RENAME TO "workflow_old";

CREATE TABLE "Workspace" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "source" TEXT,
  "companySize" TEXT,
  "plan" TEXT,
  "stripeCustomerId" TEXT,
  "priceId" TEXT,
  "trialEnd" TIMESTAMPTZ,
  "isPastDue" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "Workspace_id_idx" ON "Workspace" ("id");

INSERT INTO "Workspace" (
  "id", "name", "slug", "source", "companySize", "plan", "stripeCustomerId", "priceId", "trialEnd", "isPastDue", "createdAt", "updatedAt"
)
SELECT
  "id", "name", "slug", "source", "company_size", "plan", "stripe_customer_id", "price_id", "trial_end", "is_past_due", "created_at", "updated_at"
FROM "workspace";

ALTER TABLE "workspace" RENAME TO "workspace_old";
