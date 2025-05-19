import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";
import { z } from "zod";

export const getTask = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    });

    return TaskSchema.parse(task);
  });
