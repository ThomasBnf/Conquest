import { prisma } from "@/lib/prisma";
import { getFirstActivity } from "@/queries/activities/getFirstActivity";
import { listActivitiesIn365Days } from "@/queries/activities/listActivitiesIn365Days";
import { getMemberMetrics } from "@/queries/members/getMemberMetrics";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const updateMemberMetrics = schemaTask({
  id: "update-member-metrics",
  schema: z.object({
    member: MemberSchema,
  }),
  run: async ({ member }) => {
    const { id, workspace_id } = member;
    const today = new Date();

    const firstActivity = await getFirstActivity({ member });
    const activities = await listActivitiesIn365Days({ member });
    const metrics = await getMemberMetrics({ activities, today });

    const { pulse, presence, level } = metrics;

    await prisma.members.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        pulse,
        presence,
        level,
        first_activity: firstActivity?.created_at ?? null,
        last_activity: activities.at(-1)?.created_at ?? null,
      },
    });
  },
});
