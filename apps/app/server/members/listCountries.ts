import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const listCountries = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const members = await prisma.member.findMany({
      where: {
        workspaceId,
        country: { not: null },
      },
      select: {
        country: true,
      },
      distinct: ["country"],
    });

    return members.map((member) => member.country);
  },
);
