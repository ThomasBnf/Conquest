import { authAction } from "@/lib/authAction";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const _getMember = authAction
  .metadata({
    name: "_getMember",
  })
  .schema(
    z.object({
      id: z.string().optional(),
      slack_id: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id, slack_id } }) => {
    const workspace_id = ctx.user.workspace_id;

    const member = await prisma.member.findUnique({
      where: {
        id,
        slack_id,
        workspace_id,
      },
      include: {
        activities: true,
      },
    });

    return MemberWithActivitiesSchema.parse(member);
  });
