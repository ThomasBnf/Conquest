import { getCurrentUser } from "@/helpers/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = safeRoute
  .use(async () => {
    return await getCurrentUser();
  })
  .query(
    z.object({
      search: z.string(),
      page: z.coerce.number(),
      id: z.string(),
      desc: z.coerce.boolean(),
    }),
  )
  .handler(async (_, { data: user, query }) => {
    const { id, search, page, desc } = query;
    const workspace_id = user.workspace_id;

    const members = await prisma.member.findMany({
      where: {
        search: search ? { contains: search, mode: "insensitive" } : undefined,
        workspace_id,
      },
      include: {
        activities: {
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: getOrderBy(id, desc),
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
        desc ? sortByCreatedAt(a, b) : -sortByCreatedAt(a, b),
      );
    }

    return NextResponse.json(parsedMembers);
  });

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
  id: string | undefined,
  desc: boolean | undefined,
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
