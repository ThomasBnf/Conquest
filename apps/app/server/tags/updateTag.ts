import { FormTagSchema } from "@/features/tags/schema/form.schema";
import { prisma } from "@conquest/db/prisma";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateTag = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: FormTagSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, data } = input;

    const tag = await prisma.tag.update({
      where: {
        id,
        workspace_id,
      },
      data,
    });

    return TagSchema.parse(tag);
  });
