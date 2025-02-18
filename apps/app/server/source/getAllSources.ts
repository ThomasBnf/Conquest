import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { protectedProcedure } from "../trpc";

export const getAllSources = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const allSources = await prisma.activity_type.findMany({
      where: {
        workspace_id,
      },
      distinct: ["source"],
      select: {
        source: true,
      },
    });

    return SOURCE.array().parse(allSources.map((source) => source.source));
  },
);
