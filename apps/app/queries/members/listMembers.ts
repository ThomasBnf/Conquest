import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listMembers = authAction
  .metadata({ name: "listMembers" })
  .schema(
    z.object({
      from: z.date().optional(),
      to: z.date().optional(),
      page: z.number().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { from, to, page } }) => {
    const members = await prisma.member.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
      include: {
        activities: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
      orderBy: {
        activities: {
          _count: "desc",
        },
      },
    });

    const parsedMembers = MemberWithActivitiesSchema.array().parse(members);

    if (from && to) {
      return parsedMembers.filter((member) => {
        return member.activities.some((activity) => {
          return activity.created_at >= from && activity.created_at <= to;
        });
      });
    }

    return parsedMembers;
  });
