"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const _listMembers = authAction
  .metadata({ name: "_listMembers" })
  .schema(
    z.object({
      search: z.string(),
      page: z.number(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .action(
    async ({ ctx: { user }, parsedInput: { search, page, id, desc } }) => {
      const workspace_id = user.workspace_id;
      const orderBy = getOrderBy(id, desc);

      const members = await prisma.member.findMany({
        where: {
          search: search
            ? { contains: search, mode: "insensitive" }
            : undefined,
          workspace_id,
        },
        include: {
          activities: true,
        },
        orderBy,
        take: 50,
        skip: (page - 1) * 50,
      });

      const parsedMembers = MemberWithActivitiesSchema.array().parse(members);

      if (id === "last_activity") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByLastActivity(a, b) : -sortByLastActivity(a, b),
        );
      }

      if (id === "created_at") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByCreatedAt(a, b) : -sortByCreatedAt(a, b),
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

const sortByCreatedAt = (a: MemberWithActivities, b: MemberWithActivities) => {
  const joinedAtA = a.created_at?.getTime() ?? 0;
  const joinedAtB = b.created_at?.getTime() ?? 0;
  return joinedAtB - joinedAtA;
};

const getOrderBy = (
  id: string,
  desc: boolean,
): Prisma.MemberOrderByWithRelationInput => {
  if (!id) {
    return { last_name: desc ? "desc" : "asc" };
  }

  if (id === "activities") {
    return { activities: { _count: desc ? "desc" : "asc" } };
  }

  if (id === "last_activity" || id === "created_at") {
    return {};
  }

  return { [id]: desc ? "desc" : "asc" };
};
