import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const getAllCountries = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const countries = await prisma.member.groupBy({
      by: ["country"],
      where: {
        workspace_id,
      },
    });

    return countries
      .map((country) => country.country)
      .filter((country) => country !== null);
  },
);
