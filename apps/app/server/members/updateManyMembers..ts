import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateManyMembers = protectedProcedure
  .input(
    z.object({
      members: MemberSchema.array(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { members } = input;

    for (const member of members) {
      await prisma.member.update({
        where: {
          id: member.id,
          workspace_id,
        },
        data: member,
      });
    }
  });
