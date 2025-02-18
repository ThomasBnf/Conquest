import { FormTagSchema } from "@/features/tags/schema/form.schema";
import { prisma } from "@conquest/db/prisma";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { protectedProcedure } from "../trpc";

export const createTag = protectedProcedure
  .input(FormTagSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { name, color } = input;

    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        source: "MANUAL",
        workspace_id,
      },
    });

    return TagSchema.parse(tag);
  });
