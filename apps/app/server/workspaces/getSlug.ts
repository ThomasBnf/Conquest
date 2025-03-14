import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getSlug = protectedProcedure
  .input(
    z.object({
      slug: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { slug } = input;

    if (!slug) return 0;

    const count = await prisma.workspace.count({
      where: {
        slug,
      },
    });

    return count;
  });
