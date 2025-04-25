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

  const { id, workspaceId } = member;
  const levels = await listLevels({ workspaceId });

  const activities = await listActivities({
    period: 90,
    memberId: id,
    workspaceId,
  });

  const pulse = getPulseScore({ activities });
  const level = getLevel({ levels, pulse });

  await updateMember({
    ...member,
    pulse,
    levelId: level?.id ?? null,
    lastActivity: activities?.at(-1)?.createdAt ?? null,
  });
};
