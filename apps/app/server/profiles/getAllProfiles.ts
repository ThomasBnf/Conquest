import { prisma } from "@conquest/db/prisma";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllProfiles = protectedProcedure
  .input(
    z.object({
      memberId: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { memberId } = input;

    if (!memberId) return [];

    const profiles = await prisma.profile.findMany({
      where: {
        member_id: memberId,
        workspace_id,
      },
    });

    return ProfileSchema.array().parse(profiles);
  });
