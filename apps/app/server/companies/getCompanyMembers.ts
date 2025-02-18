import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getCompanyMembers = protectedProcedure
  .input(
    z.object({
      companyId: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { companyId } = input;

    const members = await prisma.member.findMany({
      where: {
        company_id: companyId,
        workspace_id,
      },
    });

    return MemberSchema.array().parse(members);
  });
