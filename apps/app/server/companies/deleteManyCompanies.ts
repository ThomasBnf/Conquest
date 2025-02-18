import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteManyCompanies = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { ids } = input;

    return await prisma.company.deleteMany({
      where: {
        id: { in: ids },
        workspace_id,
      },
    });
  });
