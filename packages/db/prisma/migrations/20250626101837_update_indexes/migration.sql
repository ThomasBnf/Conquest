-- CreateIndex
CREATE INDEX "Profile_workspaceId_createdAt_idx" ON "Profile"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Profile_attributes_idx" ON "Profile" USING GIN ("attributes" jsonb_ops);
