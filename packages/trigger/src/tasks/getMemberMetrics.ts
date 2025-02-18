import { getPulseScore } from "@conquest/db/helpers/getPulseScore";
import { listActivitiesIn90Days } from "@conquest/db/queries/activity/listActivitiesIn90Days";
import { getLevel } from "@conquest/db/queries/levels/getLelvel";
import { getMember } from "@conquest/db/queries/member/getMember";
import { updateMember } from "@conquest/db/queries/member/updateMember";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const getMemberMetrics = schemaTask({
  id: "get-member-metrics",
  schema: z.object({
    memberId: z.string(),
  }),
  run: async ({ memberId }) => {
    const member = await getMember({ id: memberId });

    console.log("member", member);

    if (!member) return;

    const activities = await listActivitiesIn90Days({ member });
    console.log("activities", activities);

    const pulseScore = getPulseScore({ activities });
    console.log("pulseScore", pulseScore);

    const level = await getLevel({
      pulse: pulseScore,
      workspace_id: member.workspace_id,
    });

    console.log("level", level);

    await updateMember({
      id: member.id,
      data: {
        pulse: pulseScore,
        level_id: level.id,
        last_activity: activities?.at(-1)?.created_at,
      },
    });
  },
});
