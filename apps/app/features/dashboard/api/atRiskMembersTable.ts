import { protectedProcedure } from "@/server/trpc";
import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { Prisma, prisma } from "@conquest/db/prisma";
import {
  FullMemberSchema,
  MemberSchema,
} from "@conquest/zod/schemas/member.schema";
import { z } from "zod";

export const atRiskMembersTable = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { cursor, dateRange, search, id, desc } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return [];
    }

    const orderBy = orderByParser({
      id,
      desc,
      type: "members",
    }) as Prisma.MemberOrderByWithRelationInput[];

    const members = await prisma.member.findMany({
      where: {
        workspaceId,
        isStaff: false,
        pulse: {
          gte: 20,
        },
        activities: {
          none: {
            createdAt: {
              gte: from,
              lte: to,
            },
          },
        },
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { primaryEmail: { contains: search, mode: "insensitive" } },
        ],
      },
      include: {
        profiles: true,
        company: {
          select: {
            name: true,
          },
        },
        level: {
          select: {
            name: true,
          },
        },
      },
      take: 50,
      skip: cursor ? cursor : 0,
      orderBy,
    });

    return FullMemberSchema.array().parse(members);
  });
