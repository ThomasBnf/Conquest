import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const countRuns = protectedProcedure
  .input(
    z.object({
      workflowId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { workflowId } = input;

    return await prisma.run.count({
      where: {
        workflowId,
      },
    });
  });
