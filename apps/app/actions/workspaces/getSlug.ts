"use server";

import { prisma } from "lib/prisma";
import { safeAction } from "lib/safeAction";
import { z } from "zod";

export const getSlug = safeAction
  .metadata({ name: "getSlug" })
  .schema(
    z.object({
      slug: z.string(),
    }),
  )
  .action(async ({ parsedInput: { slug } }) => {
    const count = await prisma.workspaces.count({
      where: {
        slug,
      },
    });

    return count;
  });
