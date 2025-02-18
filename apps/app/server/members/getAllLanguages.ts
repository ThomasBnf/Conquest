import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const getAllLanguages = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const languages = await prisma.member.groupBy({
      by: ["language"],
      where: {
        workspace_id,
      },
    });

    return languages
      .map((language) => language.language)
      .filter((language) => language !== null);
  },
);
