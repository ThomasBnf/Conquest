import { FormLevelSchema } from "@/features/levels/schema/form.schema";
import { prisma } from "@conquest/db/prisma";
import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { protectedProcedure } from "../trpc";

export const createLevel = protectedProcedure
  .input(FormLevelSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { name, number, from, to } = input;

    const createdLevel = await prisma.level.create({
      data: {
        name,
        number,
        from,
        to,
        workspace_id,
      },
    });

    return LevelSchema.parse(createdLevel);
  });
