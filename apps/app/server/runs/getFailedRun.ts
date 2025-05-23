import { prisma } from "@conquest/db/prisma";
import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getFailedRun = protectedProcedure
  .input(
    z.object({
      workflowId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { workflowId } = input;

    const run = await prisma.run.findFirst({
      where: {
        workflowId,
        status: "FAILED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!run) return null;
    return RunSchema.parse(run);
  });
