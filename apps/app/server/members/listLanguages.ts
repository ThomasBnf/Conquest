import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const listLanguages = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const members = await prisma.member.findMany({
      where: {
        workspaceId,
        language: { not: null },
      },
      select: {
        language: true,
      },
      distinct: ["language"],
    });

    return members.map((member) => member.language);
  },
);
