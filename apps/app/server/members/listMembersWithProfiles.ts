import { prisma } from "@conquest/db/prisma";
import { MemberWithProfilesSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listMembersWithProfiles = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .query(async ({ input, ctx: { user } }) => {
    const { ids } = input;
    const { workspaceId } = user;

    const members = await prisma.member.findMany({
      where: {
        workspaceId,
        id: { in: ids },
      },
      include: {
        profiles: true,
      },
    });

    return MemberWithProfilesSchema.array().parse(members);
  });
