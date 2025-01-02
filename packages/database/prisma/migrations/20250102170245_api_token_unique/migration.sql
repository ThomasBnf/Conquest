/*
  Warnings:

  - A unique constraint covering the columns `[key,workspace_id]` on the table `activities_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activities_types_key_workspace_id_key" ON "activities_types"("key", "workspace_id");
