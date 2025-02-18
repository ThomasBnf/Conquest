import { prisma } from "@conquest/db/prisma";
import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getLevel = protectedProcedure
  .input(
    z.object({
      id: z.string().nullable(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    if (!id) return null;

    const level = await prisma.level.findUnique({
      where: {
        id,
        workspace_id,
      },
    });

    if (!level) return null;
    return LevelSchema.parse(level);
  });
