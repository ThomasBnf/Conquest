import { prisma } from "@conquest/db/prisma";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { protectedProcedure } from "../trpc";

export const createTagOptimistic = protectedProcedure
  .input(TagSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    const tag = await prisma.tag.create({
      data: {
        ...input,
        workspaceId,
      },
    });

    return TagSchema.parse(tag);
  });
