import { listActivities } from "../activities/listActivities";
import { getPulseScore } from "../helpers/getPulseScore";
import { getLevel } from "../levels/getLevel";
import { getMember } from "./getMember";
import { updateMember } from "./updateMember";

type Props = {
  memberId: string;
};

export const getMemberMetrics = async ({ memberId }: Props) => {
  const member = await getMember({ id: memberId });

  if (!member) return;

  const { id, workspace_id } = member;

  const activities = await listActivities({
    period: 90,
    member_id: id,
    workspace_id,
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
};
