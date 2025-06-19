import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const countCompanies = protectedProcedure
  .input(
    z.object({
      search: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { search } = input;

    const count = await prisma.company.count({
      where: {
        workspaceId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return count;
  });
