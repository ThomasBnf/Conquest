import { triggerWorkflows } from "@conquest/trigger/tasks/triggerWorkflows";
import { listActivities } from "../activity/listActivities";
import { getLevel } from "../helpers/getLevel";
import { getPulseScore } from "../helpers/getPulseScore";
import { listLevels } from "../level/listLevels";
import { getMemberWithLevel } from "./getMemberWithLevel";
import { updateMember } from "./updateMember";

type Props = {
  memberId: string;
};

export const getPulseAndLevel = async ({ memberId }: Props) => {
  const member = await getMemberWithLevel({ id: memberId });

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

  const previousLevel = levels.find((l) => l.id === member.levelId);
  const newLevel = levels.find((l) => l.id === level?.id);

  if (previousLevel && newLevel && previousLevel.number < newLevel.number) {
    await triggerWorkflows.trigger({ trigger: "level-up", member });
  }
};
