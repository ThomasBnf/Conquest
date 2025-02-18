import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteApiKey = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { id } = input;
    const { workspace_id } = user;

    return await prisma.api_key.delete({
      where: {
        id,
        workspace_id,
      },
    });
  });
