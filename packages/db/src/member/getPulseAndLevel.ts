import { triggerWorkflows } from "@conquest/trigger/tasks/triggerWorkflows";
import { listActivities } from "../activity/listActivities";
import { getLevel } from "../helpers/getLevel";
import { getPulseScore } from "../helpers/getPulseScore";
import { listLevels } from "../level/listLevels";
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
    levelNumber: level?.number ?? null,
    lastActivity: activities?.at(0)?.createdAt ?? null,
  });

  const previousLevel = levels.find((l) => l.number === member.levelNumber);
  const newLevel = levels.find((l) => l.number === level?.number);

  if (previousLevel && newLevel && previousLevel.number < newLevel.number) {
    await triggerWorkflows.trigger({ trigger: "level-up", member });
  }
};
