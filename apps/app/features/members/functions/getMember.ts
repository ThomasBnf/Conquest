import { safeAction } from "@/lib/safeAction";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const getMember = safeAction
  .metadata({
    name: "getMember",
  })
  .schema(
    z.object({
      id: z.string().optional(),
      slack_id: z.string().optional(),
      workspace_id: z.string(),
    }),
  )
  .action(async ({ parsedInput: { id, slack_id, workspace_id } }) => {
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
