/*
  Warnings:

  - The values [BASIC,PREMIUM,BUSINESS,ENTERPRISE] on the enum `PLAN` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PLAN_new" AS ENUM ('EXPLORER', 'ACTIVE', 'CONTRIBUTOR', 'AMBASSADOR');
ALTER TABLE "workspace" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "workspace" ALTER COLUMN "plan" TYPE "PLAN_new" USING ("plan"::text::"PLAN_new");
ALTER TYPE "PLAN" RENAME TO "PLAN_old";
ALTER TYPE "PLAN_new" RENAME TO "PLAN";
DROP TYPE "PLAN_old";
COMMIT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar_url" TEXT;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "is_past_due" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "trial_end" TIMESTAMP(3),
ALTER COLUMN "plan" DROP NOT NULL,
ALTER COLUMN "plan" DROP DEFAULT;
