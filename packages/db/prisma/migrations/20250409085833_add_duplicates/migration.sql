-- CreateEnum
CREATE TYPE "REASON" AS ENUM ('EMAIL', 'NAME', 'USERNAME');

-- CreateEnum
CREATE TYPE "STATE" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "last_duplicates_checked_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "duplicate" (
    "id" TEXT NOT NULL,
    "member_ids" TEXT[],
    "reason" "REASON" NOT NULL,
    "state" "STATE" NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duplicate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "duplicate_workspace_id_idx" ON "duplicate"("workspace_id");

-- AddForeignKey
ALTER TABLE "duplicate" ADD CONSTRAINT "duplicate_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
