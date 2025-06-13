import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "@/server/trpc";

export const deleteWorkflow = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input: { id } }) => {
    const { workspaceId } = user;

    return await prisma.workflow.delete({
      where: {
        id,
        workspaceId,
      },
    });
  });
