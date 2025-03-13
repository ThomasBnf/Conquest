import { listActivities } from "@conquest/clickhouse/activities/listActivities";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { getLevel } from "@conquest/clickhouse/levels/getLevel";
import { getMember } from "@conquest/clickhouse/members/getMember";
import { updateMember } from "@conquest/clickhouse/members/updateMember";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const getMemberMetrics = schemaTask({
  id: "get-member-metrics",
  schema: z.object({
    memberId: z.string(),
  }),
  run: async ({ memberId }) => {
    const member = await getMember({ id: memberId });
    const { workspace_id } = member ?? {};

    if (!member || !workspace_id) return;

    const activities = await listActivities({
      member_id: member.id,
      period: 90,
      workspace_id: member.workspace_id,
    });

    const pulseScore = getPulseScore({ activities });

    const level = await getLevel({
      pulse: pulseScore,
      workspace_id,
    });

    await updateMember({
      ...member,
      pulse: pulseScore,
      level_id: level?.id ?? null,
      last_activity: activities?.at(-1)?.created_at ?? null,
    });
  },
});
