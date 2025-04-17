-- CreateTable
CREATE TABLE "memberInWorkspace" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberInWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memberInWorkspace_user_id_idx" ON "memberInWorkspace"("user_id");

-- CreateIndex
CREATE INDEX "memberInWorkspace_workspace_id_idx" ON "memberInWorkspace"("workspace_id");

-- AddForeignKey
ALTER TABLE "memberInWorkspace" ADD CONSTRAINT "memberInWorkspace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberInWorkspace" ADD CONSTRAINT "memberInWorkspace_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;


INSERT INTO "memberInWorkspace" ("id", "user_id", "workspace_id", "created_at", "updated_at")
SELECT 
    gen_random_uuid()::text,
    u.id,
    u.workspace_id,
    u.created_at,
    u.updated_at
FROM "user" u; 