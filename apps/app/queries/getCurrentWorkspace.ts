import { auth } from "@/auth";
import { prisma } from "@conquest/db/prisma";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { redirect } from "next/navigation";

export const getCurrentWorkspace = async () => {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login");

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: session.user.workspaceId,
    },
  });

  return {
    user: session.user,
    workspace: WorkspaceSchema.parse(workspace),
  };
};
