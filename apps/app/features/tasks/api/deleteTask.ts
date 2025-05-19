import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { z } from "zod";

export const deleteTask = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    await prisma.task.delete({
      where: {
        id,
      },
    });
  });
