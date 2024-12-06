-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SOURCE" ADD VALUE 'BREVO';
ALTER TYPE "SOURCE" ADD VALUE 'GITHUB';
ALTER TYPE "SOURCE" ADD VALUE 'HUBSPOT';
ALTER TYPE "SOURCE" ADD VALUE 'LINKEDIN';
ALTER TYPE "SOURCE" ADD VALUE 'LIVESTORM';
ALTER TYPE "SOURCE" ADD VALUE 'X';
ALTER TYPE "SOURCE" ADD VALUE 'YOUTUBE';
ALTER TYPE "SOURCE" ADD VALUE 'ZENDESK';
