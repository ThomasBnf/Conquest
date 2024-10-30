/*
  Warnings:

  - You are about to drop the column `phone` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `slug` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_workspace_id_fkey";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "phone",
ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "joined_at" TIMESTAMP(3),
ADD COLUMN     "left_at" TIMESTAMP(3),
ADD COLUMN     "phones" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "slug" SET NOT NULL;

-- DropTable
DROP TABLE "Organization";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "address" TEXT,
    "website" TEXT,
    "employees" INTEGER,
    "founded_at" TIMESTAMP(3),
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_website_key" ON "Company"("website");

-- CreateIndex
CREATE INDEX "Company_id_workspace_id_idx" ON "Company"("id", "workspace_id");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
