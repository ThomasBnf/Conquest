import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteManyMembers = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { ids } = input;

    console.log(ids);

    return await prisma.member.deleteMany({
      where: {
        id: { in: ids },
        workspace_id,
      },
    });
  });
