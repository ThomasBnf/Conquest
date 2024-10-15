import { TagSchema } from "@conquest/zod/tag.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

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
