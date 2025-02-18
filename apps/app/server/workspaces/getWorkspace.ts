import { prisma } from "@conquest/db/prisma";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { protectedProcedure } from "../trpc";

export const getWorkspace = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspace_id },
    });

    return WorkspaceSchema.parse(workspace);
  },
);
