-- AlterTable
ALTER TABLE "user" ALTER COLUMN "members_preferences" SET DEFAULT '{"id":"level","desc":true,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}',
ALTER COLUMN "companies_preferences" SET DEFAULT '{"id":"name","desc":false,"groupFilters":{"filters":[],"operator":"AND"},"columnVisibility":{},"columnOrder":[]}';

-- CreateIndex
CREATE INDEX "list_created_by_workspace_id_idx" ON "list"("created_by", "workspace_id");

-- CreateIndex
CREATE INDEX "tag_workspace_id_idx" ON "tag"("workspace_id");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "user"("id");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "workflow_workspace_id_idx" ON "workflow"("workspace_id");
