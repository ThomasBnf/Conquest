-- AlterTable
ALTER TABLE "activities_types" ADD COLUMN     "channels" TEXT[] DEFAULT ARRAY[]::TEXT[];
