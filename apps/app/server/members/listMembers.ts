import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      companyId: z.string().nullish(),
      cursor: z.string().nullish(),
      take: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, companyId, cursor, take } = input;

    const members = await prisma.member.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            last_name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            primary_email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
        ...(companyId ? { company_id: companyId } : {}),
        workspace_id,
      },
      orderBy: {
        first_name: "asc",
      },
      ...(cursor ? { skip: 1 } : {}),
      cursor: cursor ? { id: cursor } : undefined,
      take,
    });

    return MemberSchema.array().parse(members);
  });
