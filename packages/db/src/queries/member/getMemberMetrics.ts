import { getPulseScore } from "../../helpers/getPulseScore";
import { listActivitiesIn90Days } from "../activity/listActivitiesIn90Days";
import { getLevel } from "../levels/getLelvel";
import { getMember } from "./getMember";
import { updateMember } from "./updateMember";

type Props = {
  memberId: string;
};

export const getMemberMetrics = async ({ memberId }: Props) => {
  const member = await getMember({ id: memberId });

  if (!member) return;

  const activities = await listActivitiesIn90Days({ member });

  const pulseScore = getPulseScore({ activities });

  const level = await getLevel({
    pulse: pulseScore,
    workspace_id: member.workspace_id,
  });

  await updateMember({
    id: member.id,
    data: {
      pulse: pulseScore,
      level_id: level.id,
      last_activity: activities?.at(-1)?.created_at,
    },
  });
};
