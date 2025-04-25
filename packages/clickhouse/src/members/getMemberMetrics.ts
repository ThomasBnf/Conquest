import type { Level } from "@conquest/zod/schemas/level.schema";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import {
  eachWeekOfInterval,
  endOfDay,
  startOfDay,
  subDays,
  subWeeks,
} from "date-fns";
import { randomUUID } from "node:crypto";
import { listActivities } from "../activities/listActivities";
import { getLevel } from "../helpers/getLevel";
import { getPulseScore } from "../helpers/getPulseScore";
import { createManyLogs } from "../logs/createManyLogs";
import { updateMember } from "./updateMember";

type Props = {
  member: Member;
  levels: Level[];
};

export const getMemberMetrics = async ({ member, levels }: Props) => {
  const { id, workspaceId } = member;

  const today = new Date();
  const startDate = startOfDay(subWeeks(today, 52));
  const endDate = endOfDay(today);

  const intervals = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 },
  );

  const activities = await listActivities({
    memberId: id,
    period: 365,
    workspaceId,
  });

  const logs: Log[] = [];

  for (const interval of intervals) {
    const intervalEnd = interval;
    const intervalStart = subDays(intervalEnd, 90);

    const filteredActivities = activities?.filter(
      (activity) =>
        activity.createdAt >= intervalStart &&
        activity.createdAt <= intervalEnd,
    );

    const pulseScore = getPulseScore({
      activities: filteredActivities,
    });

    const level = getLevel({ levels, pulse: pulseScore });

    logs.push({
      id: randomUUID(),
      date: interval,
      pulse: pulseScore,
      levelId: level?.id ?? null,
      memberId: member.id,
      workspaceId: member.workspaceId,
    });
  }

  await createManyLogs({ logs });

  const { pulse, levelId } = logs.at(-1) ?? {};

  await updateMember({
    ...member,
    firstActivity: activities?.at(-1)?.createdAt ?? null,
    lastActivity: activities?.at(0)?.createdAt ?? null,
    pulse: pulse ?? 0,
    levelId: levelId ?? null,
  });
};
