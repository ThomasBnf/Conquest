import { prisma } from "@conquest/db/prisma";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { protectedProcedure } from "../trpc";

export const listSourcesProfile = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const profiles = await prisma.profile.findMany({
      where: {
        workspaceId,
      },
    });

    const parsedProfiles = ProfileSchema.array().parse(profiles);

    return [
      ...new Set(parsedProfiles.map((profile) => profile.attributes.source)),
    ];
  },
);
