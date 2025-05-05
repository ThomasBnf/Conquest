import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteWorkflow = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input: { id } }) => {
    const { workspaceId } = user;

    await prisma.workflow.delete({
      where: {
        id,
        workspaceId,
      },
    });

    return { success: true };
  });
