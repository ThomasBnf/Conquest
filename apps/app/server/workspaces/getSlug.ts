import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getSlug = protectedProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { slug } = input;

    const count = await prisma.workspace.count({
      where: {
        slug,
      },
    });

    return count;
  });
