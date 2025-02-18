import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getMember = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      source: SOURCE.optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, source } = input;

    if (source) {
      const profile = await prisma.profile.findUnique({
        where: {
          external_id_workspace_id: {
            external_id: id,
            workspace_id,
          },
        },
        include: {
          member: true,
        },
      });

      return MemberSchema.parse(profile?.member);
    }

    const member = await prisma.member.findUnique({
      where: {
        id,
        workspace_id,
      },
    });

    if (!member) return null;
    return MemberSchema.parse(member);
  });
