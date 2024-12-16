import { prisma } from "@/lib/prisma";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";

export const listWorkspaces = async () => {
  const workspaces = await prisma.workspaces.findMany({
    include: {
      integrations: true,
    },
  });

  return WorkspaceSchema.array().parse(workspaces);
};
