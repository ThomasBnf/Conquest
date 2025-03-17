/*
  Warnings:

  - You are about to drop the column `plan` on the `workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar_url" TEXT;

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "plan",
ADD COLUMN     "is_past_due" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "trial_end" TIMESTAMP(3);

-- DropEnum
DROP TYPE "PLAN";
