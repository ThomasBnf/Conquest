import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteMember = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    return await prisma.member.delete({
      where: {
        id,
        workspace_id,
      },
    });
  });
