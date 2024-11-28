"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ActivityWithMemberSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const _listCompanyActivities = authAction
  .metadata({
    name: "_listCompanyActivities",
  })
  .schema(
    z.object({
      company_id: z.string(),
      page: z.number(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { company_id, page } = parsedInput;
    const workspace_id = ctx.user.workspace_id;

    const activities = await prisma.activities.findMany({
      where: {
        member: {
          company_id,
        },
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
