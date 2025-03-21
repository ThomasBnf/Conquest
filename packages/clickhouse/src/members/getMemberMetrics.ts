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
import { getPulseScore } from "../helpers/getPulseScore";
import { createManyLogs } from "../logs/createManyLogs";
import { updateMember } from "./updateMember";

type Props = {
  member: Member;
  levels: Level[];
};

export const getMemberMetrics = async ({ member, levels }: Props) => {
  const { id, workspace_id } = member;

  const today = new Date();
  const startDate = startOfDay(subWeeks(today, 52));
  const endDate = endOfDay(today);

  const intervals = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 },
  );

  const activities = await listActivities({
    member_id: id,
    period: 365,
    workspace_id,
  });

  const logs: Log[] = [];

  for (const interval of intervals) {
    const intervalEnd = interval;
    const intervalStart = subDays(intervalEnd, 90);

    const filteredActivities = activities?.filter(
      (activity) =>
        activity.created_at >= intervalStart &&
        activity.created_at <= intervalEnd,
    );

    const pulseScore = getPulseScore({
      activities: filteredActivities,
    });

    const level = levels.find(
      (level) =>
        pulseScore >= level.from &&
        (level.to === null || pulseScore <= level.to),
    );

    logs.push({
      id: randomUUID(),
      date: interval,
      pulse: pulseScore,
      level_id: level?.id ?? null,
      member_id: member.id,
      workspace_id: member.workspace_id,
    });
  }

  await createManyLogs({ logs });

  const { pulse, level_id } = logs.at(-1) ?? {};

  await updateMember({
    ...member,
    first_activity: activities?.at(-1)?.created_at ?? null,
    last_activity: activities?.at(0)?.created_at ?? null,
    pulse: pulse ?? 0,
    level_id: level_id ?? null,
  });
};
