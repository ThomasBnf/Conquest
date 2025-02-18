import { prisma } from "@conquest/db/prisma";
import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { protectedProcedure } from "../trpc";

export const getAllLevels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const levels = await prisma.level.findMany({
      where: {
        workspace_id,
      },
      orderBy: {
        number: "desc",
      },
    });

    return LevelSchema.array().parse(levels);
  },
);
