CREATE TABLE "Accounts" (
  "id" TEXT NOT NULL,
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

  CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Accounts" (
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
  "user_id",
  "type",
  "provider",
  "provider_account_id",
  "refresh_token",
  "access_token",
  "expires_at",
  "token_type",
  "scope",
  "id_token",
  "session_state"
FROM "accounts";


CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ApiKey" ("id", "name", "token", "workspaceId", "createdAt")
SELECT "id", "name", "token", "workspace_id", "created_at"
FROM "api_key";


CREATE TABLE "Duplicate" (
  "id" TEXT NOT NULL,
  "memberIds" TEXT[] NOT NULL,
  "reason" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "totalPulse" INTEGER NOT NULL DEFAULT 0,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "Duplicate_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Duplicate" (
  "id", "memberIds", "reason", "state", "totalPulse", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "member_ids", "reason", "state", "total_pulse", "workspace_id", "created_at", "updated_at"
FROM "duplicate";


CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ NOT NULL,
  "endedAt" TIMESTAMPTZ,
  "source" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Event" (
  "id", "externalId", "title", "startedAt", "endedAt", "source", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "external_id", "title", "started_at", "ended_at", "source", "workspace_id", "created_at", "updated_at"
FROM "event";


CREATE TABLE "Integration" (
  "id" TEXT NOT NULL,
  "externalId" TEXT,
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

  CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Integration" (
  "id", "externalId", "connectedAt", "status", "details", "triggerToken", "expiresAt", "runId", "createdBy", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "external_id", "connected_at", "status", "details", "trigger_token", "expires_at", "run_id", "created_by", "workspace_id", "created_at", "updated_at"
FROM "integration";


CREATE TABLE "List" (
  "id" TEXT NOT NULL,
  "emoji" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "groupFilters" JSON NOT NULL DEFAULT '{"filters":[],"operator":"AND"}',
  "createdBy" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

INSERT INTO "List" (
  "id", "emoji", "name", "groupFilters", "createdBy", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "emoji", "name", "groupFilters", "created_by", "workspace_id", "created_at", "updated_at"
FROM "list";


CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMPTZ NOT NULL,

  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Session" (
  "id", "sessionToken", "userId", "expires"
)
SELECT
  "id", "session_token", "user_id", "expires"
FROM "sessions";


CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "externalId" TEXT,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Tag" (
  "id", "externalId", "name", "color", "source", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "external_id", "name", "color", "source", "workspace_id", "created_at", "updated_at"
FROM "tag";


CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
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

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

INSERT INTO "User" (
  "id", "email", "email_verified", "firstName", "lastName", "avatarUrl", "onboarding", "role", "lastActivityAt",
  "membersPreferences", "companiesPreferences", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "email", "email_verified", "first_name", "last_name", "avatar_url", "onboarding", "role", "last_activity_at",
  "members_preferences", "companies_preferences", "workspace_id", "created_at", "updated_at"
FROM "user";


CREATE TABLE "UserInWorkspace" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "UserInWorkspace_pkey" PRIMARY KEY ("id")
);

INSERT INTO "UserInWorkspace" (
  "id", "userId", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "user_id", "workspace_id", "created_at", "updated_at"
FROM "userInWorkspace";


CREATE TABLE "UserInvitation" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
);

INSERT INTO "UserInvitation" (
  "id", "email", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "email", "workspace_id", "created_at", "updated_at"
FROM "userInvitation";


CREATE TABLE "VerificationTokens" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMPTZ NOT NULL,

  CONSTRAINT "VerificationTokens_pkey" PRIMARY KEY ("id")
);

INSERT INTO "VerificationTokens" (
  "id", "identifier", "token", "expires"
)
SELECT
  "id", "identifier", "token", "expires"
FROM "verification_tokens";


CREATE TABLE "Workflow" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "nodes" JSON[] NOT NULL,
  "edges" JSON[] NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "lastRunAt" TIMESTAMPTZ,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Workflow" (
  "id", "name", "description", "nodes", "edges", "published", "lastRunAt", "workspaceId", "createdAt", "updatedAt"
)
SELECT
  "id", "name", "description", "nodes", "edges", "published", "last_run_at", "workspace_id", "created_at", "updated_at"
FROM "workflow";


CREATE TABLE "Workspace" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "source" TEXT,
  "companySize" TEXT,
  "plan" TEXT,
  "stripeCustomerId" TEXT,
  "priceId" TEXT,
  "trialEnd" TIMESTAMPTZ,
  "isPastDue" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Workspace" (
  "id", "name", "slug", "source", "companySize", "plan", "stripeCustomerId", "priceId", "trialEnd", "isPastDue", "createdAt", "updatedAt"
)
SELECT
  "id", "name", "slug", "source", "company_size", "plan", "stripe_customer_id", "price_id", "trial_end", "is_past_due", "created_at", "updated_at"
FROM "workspace";

ALTER TABLE "Account" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApiKey" ADD CONSTRAINT "api_key_workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Event" ADD CONSTRAINT "event_workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Integration" ADD CONSTRAINT "integration_workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "List" ADD CONSTRAINT "list_workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Tag" ADD CONSTRAINT "tag_workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "user_workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Workflow" ADD CONSTRAINT "workflow_workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "Account"("provider", "provider_account_id");

CREATE UNIQUE INDEX "api_key_token_key" ON "ApiKey"("token");

CREATE UNIQUE INDEX "event_external_id_key" ON "Event"("externalId");

CREATE UNIQUE INDEX "integration_external_id_key" ON "Integration"("externalId");

CREATE UNIQUE INDEX "sessions_session_token_key" ON "Session"("sessionToken");

CREATE UNIQUE INDEX "tag_external_id_workspace_id_key" ON "Tag"("externalId", "workspaceId");

CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "VerificationTokens"("identifier", "token");

CREATE UNIQUE INDEX "workspace_slug_key" ON "Workspace"("slug");