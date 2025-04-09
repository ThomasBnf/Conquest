import { listActivities } from "../activities/listActivities";
import { getLevel } from "../helpers/getLevel";
import { getPulseScore } from "../helpers/getPulseScore";
import { listLevels } from "../levels/listLevels";
import { getMember } from "./getMember";
import { updateMember } from "./updateMember";

type Props = {
  memberId: string;
};

export const getPulseAndLevel = async ({ memberId }: Props) => {
  const member = await getMember({ id: memberId });

  if (!member) return;

  const { id, workspace_id } = member;
  const levels = await listLevels({ workspace_id });

  const activities = await listActivities({
    period: 90,
    member_id: id,
    workspace_id,
  });

  const pulse = getPulseScore({ activities });
  const level = getLevel({ levels, pulse });

  await updateMember({
    ...member,
    pulse,
    level_id: level?.id ?? null,
    last_activity: activities?.at(-1)?.created_at ?? null,
  });
};
