"use server";

import { prisma } from "@/lib/prisma";
import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import type { Prisma } from "@prisma/client";
import { authAction } from "lib/authAction";
import { z } from "zod";

export const listMembers = authAction
  .metadata({ name: "listMembers" })
  .schema(
    z.object({
      page: z.number().optional(),
      search: z.string().optional(),
      id: z.string().optional(),
      desc: z.boolean().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
    }),
  )
  .action(
    async ({ ctx, parsedInput: { page, search, id, desc, from, to } }) => {
      const where: Prisma.MemberWhereInput = {
        workspace_id: ctx.user.workspace_id,
        search: search ? { contains: search, mode: "insensitive" } : undefined,
      };

      const include: Prisma.MemberInclude = {
        activities: {
          orderBy: { created_at: "desc" },
          where: {
            created_at: {
              gte: from ?? undefined,
              lte: to ?? undefined,
            },
          },
        },
      };

      const members = await prisma.member.findMany({
        where,
        include,
        orderBy:
          id && !["last_activity", "created_at"].includes(id)
            ? getOrderBy(id, desc)
            : undefined,
        take: page ? 50 : undefined,
        skip: page ? (page - 1) * 50 : undefined,
      });

      const parsedMembers = MemberWithActivitiesSchema.array().parse(members);

      if (id === "last_activity") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByLastActivity(a, b) : -sortByLastActivity(a, b),
        );
      }

      if (id === "created_at") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByJoinedAt(a, b) : -sortByJoinedAt(a, b),
        );
      }

      return parsedMembers;
    },
  );

const sortByLastActivity = (
  a: MemberWithActivities,
  b: MemberWithActivities,
) => {
  const lastActivityA = a.activities[0]?.created_at?.getTime() ?? 0;
  const lastActivityB = b.activities[0]?.created_at?.getTime() ?? 0;
  return lastActivityB - lastActivityA;
};

const sortByJoinedAt = (a: MemberWithActivities, b: MemberWithActivities) => {
  const joinedAtA = a.created_at?.getTime() ?? 0;
  const joinedAtB = b.created_at?.getTime() ?? 0;
  return joinedAtB - joinedAtA;
};

const getOrderBy = (
  id: string | undefined,
  desc: boolean | undefined,
): Prisma.MemberOrderByWithRelationInput => {
  if (id === "activities") {
    return { activities: { _count: desc ? "desc" : "asc" } };
  }
  return { [id as string]: desc ? "desc" : "asc" };
};
