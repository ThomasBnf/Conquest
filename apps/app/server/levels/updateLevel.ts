import { FormLevelSchema } from "@/features/levels/schema/form.schema";
import { prisma } from "@conquest/db/prisma";
import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateLevel = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      data: FormLevelSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, data } = input;
    const { name, number, from, to } = data;

    const createdLevel = await prisma.level.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        name,
        number,
        from,
        to,
      },
    });

    return LevelSchema.parse(createdLevel);
  });
