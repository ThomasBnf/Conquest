"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { TagSchema } from "@/schemas/tag.schema";

export const listTags = authAction
  .metadata({ name: "listTags" })
  .action(async ({ ctx }) => {
    const tags = await prisma.tag.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return TagSchema.array().parse(tags);
  });
