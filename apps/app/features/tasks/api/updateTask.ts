import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { prisma } from "@conquest/db/prisma";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";
import { z } from "zod";

export const updateTask = protectedProcedure
  .input(
    TaskSchema.partial().extend({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    await prisma.task.update({
      where: {
        id: input.id,
      },
      data: input,
    });
  });
