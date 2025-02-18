import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateMember = protectedProcedure
  .input(
    z.object({
      id: z.string().nullable(),
      data: MemberSchema.partial(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, data } = input;
    const { tags } = data;

    if (!id) return null;

    const member = await prisma.member.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        ...data,
        tags: tags ? { set: tags } : undefined,
      },
    });

    return MemberSchema.parse(member);
  });
