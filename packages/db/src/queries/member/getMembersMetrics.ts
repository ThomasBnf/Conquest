import { prisma } from "@conquest/db/prisma";
import { listActivitiesIn365Days } from "@conquest/db/queries/activity/listActivitiesIn365Days";
import type { Level } from "@conquest/zod/schemas/level.schema";
import type { Log, Member } from "@conquest/zod/schemas/member.schema";
import {
  eachWeekOfInterval,
  endOfDay,
  startOfDay,
  subDays,
  subWeeks,
} from "date-fns";
import { getPulseScore } from "../../helpers/getPulseScore";

type Props = {
  members: Member[] | undefined;
  levels: Level[];
};

export const getMembersMetrics = async ({ members, levels }: Props) => {
  const today = new Date();
  const startDate = startOfDay(subWeeks(today, 52));
  const endDate = endOfDay(today);

  const intervals = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 },
  );

  await Promise.all(
    members?.map(async (member) => {
      const activities = await listActivitiesIn365Days({ member });

      const logs: Log[] = [];

      for (const interval of intervals) {
        const intervalEnd = interval;
        const intervalStart = subDays(intervalEnd, 90);

        const filteredActivities = activities?.filter(
          (activity) =>
            activity.created_at >= intervalStart &&
            activity.created_at <= intervalEnd,
        );

        const pulseScore = getPulseScore({ activities: filteredActivities });

        const level = levels.find(
          (level) =>
            pulseScore >= level.from &&
            pulseScore <= (level.to ?? Number.POSITIVE_INFINITY),
        );

        logs.push({
          date: interval.toString(),
          pulse: pulseScore,
          levelId: level?.id ?? null,
        });
      }

      const { pulse, levelId } = logs.at(-1) ?? {};

      await prisma.member.update({
        where: {
          id: member.id,
        },
        data: {
          pulse,
          level_id: levelId,
          logs,
          first_activity: activities?.at(0)?.created_at,
          last_activity: activities?.at(-1)?.created_at,
        },
      });
    }) ?? [],
  );
};
