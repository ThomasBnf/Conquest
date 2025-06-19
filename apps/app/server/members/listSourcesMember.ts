import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const listSourcesMember = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const members = await prisma.member.findMany({
      where: {
        workspaceId,
      },
      select: {
        source: true,
      },
      distinct: ["source"],
    });

    return members.map((member) => member.source);
  },
);
