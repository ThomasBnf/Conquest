/*
  Warnings:

  - You are about to drop the column `location` on the `members` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `integrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "created_by" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "location",
ADD COLUMN     "custom_fields" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "locale" TEXT;

-- CreateTable
CREATE TABLE "lists" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB[],
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lists_id_workspace_id_idx" ON "lists"("id", "workspace_id");

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
