"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ActivityWithMemberSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const _listActivities = authAction
  .metadata({
    name: "_listActivities",
  })
  .schema(
    z.object({
      member_id: z.string().optional(),
      page: z.number(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { member_id, page } = parsedInput;
    const workspace_id = ctx.user.workspace_id;

    const activities = await prisma.activity.findMany({
      where: {
        member_id,
        workspace_id,
      },
      include: {
        member: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 50,
      skip: (page - 1) * 50,
    });

    return z.array(ActivityWithMemberSchema).parse(activities);
  });
