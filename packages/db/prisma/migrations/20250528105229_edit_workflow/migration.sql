-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "alertOnFailure" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alertOnSuccess" BOOLEAN NOT NULL DEFAULT true;
