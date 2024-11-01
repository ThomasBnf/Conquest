import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ActivityWithMemberSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const listActivities = safeAction
  .metadata({
    name: "listActivities",
  })
  .schema(
    z.object({
      member_id: z.string().optional(),
      page: z.number().optional(),
      workspace_id: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { member_id, page, workspace_id } = parsedInput;

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
      take: page ? 50 : undefined,
      skip: page ? (page - 1) * 50 : undefined,
    });

    return z.array(ActivityWithMemberSchema).parse(activities);
  });
