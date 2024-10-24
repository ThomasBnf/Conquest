import { ActivityWithMemberSchema } from "@conquest/zod/activity.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listActivities = authAction
  .metadata({
    name: "listActivities",
  })
  .schema(
    z.object({
      member_id: z.string().optional(),
      page: z.number().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { member_id, page, from, to } }) => {
    const activities = await prisma.activity.findMany({
      where: {
        member_id,
        workspace_id: ctx.user.workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
      include: {
        member: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: page ? 50 : undefined,
      skip: page ? (page - 1) * 50 : undefined,
    });

    return ActivityWithMemberSchema.array().parse(activities);
  });
