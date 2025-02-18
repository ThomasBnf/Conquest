import { prisma } from "@conquest/db/prisma";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { protectedProcedure } from "../trpc";

export const getAllTags = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const tags = await prisma.tag.findMany({
      where: {
        workspace_id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return TagSchema.array().parse(tags);
  },
);
