import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const deleteWorkspace = protectedProcedure.mutation(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { success: true };
  },
);
