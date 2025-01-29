import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { prisma } from "../../prisma";

export const listWorkspaces = async () => {
  const workspaces = await prisma.workspaces.findMany({
    include: {
      integrations: true,
    },
  });

  return WorkspaceSchema.array().parse(workspaces);
};
