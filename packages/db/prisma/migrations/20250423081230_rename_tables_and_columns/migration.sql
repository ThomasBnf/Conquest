/*
  Warnings:

  - You are about to drop the `invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `memberInWorkspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "memberInWorkspace" DROP CONSTRAINT "memberInWorkspace_user_id_fkey";

-- DropForeignKey
ALTER TABLE "memberInWorkspace" DROP CONSTRAINT "memberInWorkspace_workspace_id_fkey";

-- DropTable
DROP TABLE "invitation";

-- DropTable
DROP TABLE "memberInWorkspace";

-- CreateTable
CREATE TABLE "userInWorkspace" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userInWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userInWorkspace_user_id_idx" ON "userInWorkspace"("user_id");

-- CreateIndex
CREATE INDEX "userInWorkspace_workspace_id_idx" ON "userInWorkspace"("workspace_id");

-- CreateIndex
CREATE INDEX "userInvitation_workspace_id_idx" ON "userInvitation"("workspace_id");

-- AddForeignKey
ALTER TABLE "userInWorkspace" ADD CONSTRAINT "userInWorkspace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userInWorkspace" ADD CONSTRAINT "userInWorkspace_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userInvitation" ADD CONSTRAINT "userInvitation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
