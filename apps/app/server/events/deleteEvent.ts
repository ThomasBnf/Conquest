import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteEvent = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { id } = input;
    const { workspace_id } = user;

    return await prisma.event.delete({
      where: { id, workspace_id },
    });
  });
