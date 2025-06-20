import { prisma } from "@conquest/db/prisma";
import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listRuns = protectedProcedure
  .input(
    z.object({
      workflowId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { workflowId } = input;

    const runs = await prisma.run.findMany({
      where: {
        workflowId,
      },
    });

    console.log(runs);

    return RunSchema.array().parse(runs);
  });
