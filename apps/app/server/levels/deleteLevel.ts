import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteLevel = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    return await prisma.level.delete({
      where: {
        id,
        workspace_id,
      },
    });
  });
