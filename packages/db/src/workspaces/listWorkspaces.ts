import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { prisma } from "../prisma";

export const listWorkspaces = async () => {
  const workspaces = await prisma.workspace.findMany();

  return WorkspaceSchema.array().parse(workspaces);
};
