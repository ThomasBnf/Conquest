-- AlterTable
ALTER TABLE "Duplicate" ALTER COLUMN "memberIds" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "memberId" TEXT;

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "activityTypeKey" TEXT NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "replyTo" TEXT,
    "reactTo" TEXT,
    "inviteTo" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "sentiment" TEXT,
    "keywords" TEXT[],
    "category" TEXT,
    "topics" TEXT[],
    "source" "SOURCE" NOT NULL,
    "channelId" TEXT,
    "eventId" TEXT,
    "memberId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityType" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "SOURCE" NOT NULL,
    "points" INTEGER NOT NULL,
    "conditions" JSONB[],
    "deletable" BOOLEAN NOT NULL DEFAULT false,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("key","workspaceId")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "SOURCE" NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "address" TEXT,
    "domain" TEXT,
    "employees" INTEGER,
    "foundedAt" TIMESTAMP(3),
    "logoUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" "SOURCE" NOT NULL,
    "customFields" JSONB[],
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("number","workspaceId")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pulse" INTEGER NOT NULL,
    "level" INTEGER,
    "memberId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jobTitle" TEXT,
    "avatarUrl" TEXT,
    "country" TEXT,
    "language" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkedinUrl" TEXT,
    "levelNumber" INTEGER,
    "pulse" INTEGER NOT NULL DEFAULT 0,
    "source" "SOURCE" NOT NULL,
    "companyId" TEXT,
    "firstActivity" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "customFields" JSONB NOT NULL DEFAULT '[]',
    "atRiskMember" BOOLEAN DEFAULT false,
    "potentialAmbassador" BOOLEAN DEFAULT false,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "attributes" JSONB NOT NULL,
    "memberId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_workspaceId_createdAt_idx" ON "Activity"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_memberId_createdAt_idx" ON "Activity"("memberId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_externalId_workspaceId_key" ON "Activity"("externalId", "workspaceId");

-- CreateIndex
CREATE INDEX "ActivityType_key_workspaceId_idx" ON "ActivityType"("key", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_externalId_key" ON "Channel"("externalId");

-- CreateIndex
CREATE INDEX "Channel_externalId_workspaceId_idx" ON "Channel"("externalId", "workspaceId");

-- CreateIndex
CREATE INDEX "Channel_source_workspaceId_idx" ON "Channel"("source", "workspaceId");

-- CreateIndex
CREATE INDEX "Company_workspaceId_name_createdAt_idx" ON "Company"("workspaceId", "name", "createdAt");

-- CreateIndex
CREATE INDEX "Company_workspaceId_idx" ON "Company"("workspaceId");

-- CreateIndex
CREATE INDEX "Level_number_workspaceId_idx" ON "Level"("number", "workspaceId");

-- CreateIndex
CREATE INDEX "Log_memberId_date_idx" ON "Log"("memberId", "date");

-- CreateIndex
CREATE INDEX "Member_workspaceId_levelNumber_pulse_id_idx" ON "Member"("workspaceId", "levelNumber", "pulse", "id");

-- CreateIndex
CREATE INDEX "Member_workspaceId_createdAt_idx" ON "Member"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Member_workspaceId_lastActivity_idx" ON "Member"("workspaceId", "lastActivity");

-- CreateIndex
CREATE INDEX "Member_workspaceId_firstActivity_idx" ON "Member"("workspaceId", "firstActivity");

-- CreateIndex
CREATE INDEX "Profile_externalId_workspaceId_idx" ON "Profile"("externalId", "workspaceId");

-- CreateIndex
CREATE INDEX "Profile_memberId_workspaceId_idx" ON "Profile"("memberId", "workspaceId");

-- CreateIndex
CREATE INDEX "Profile_workspaceId_idx" ON "Profile"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_externalId_workspaceId_key" ON "Profile"("externalId", "workspaceId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_activityTypeKey_workspaceId_fkey" FOREIGN KEY ("activityTypeKey", "workspaceId") REFERENCES "ActivityType"("key", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityType" ADD CONSTRAINT "ActivityType_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_levelNumber_workspaceId_fkey" FOREIGN KEY ("levelNumber", "workspaceId") REFERENCES "Level"("number", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
