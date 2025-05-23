import { prisma } from "@conquest/db/prisma";
import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getRun = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    const run = await prisma.run.findFirst({
      where: {
        id,
      },
    });

    if (!run) return null;
    return RunSchema.parse(run);
  });
