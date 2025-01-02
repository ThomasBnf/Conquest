import { prisma } from "@/lib/prisma";
import type { Log, Member } from "@conquest/zod/schemas/member.schema";
import { eachWeekOfInterval, endOfDay, subDays } from "date-fns";
import { getFirstActivity } from "../activities/getFirstActivity";
import { listActivitiesIn365Days } from "../activities/listActivitiesIn365Days";
import { getMemberMetrics } from "./getMemberMetrics";

type Props = {
  member: Member;
};

export const calculateMemberMetrics = async ({ member }: Props) => {
  const { id, workspace_id } = member;

  const today = new Date();
  const last365Days = subDays(today, 365);

  const firstActivity = await getFirstActivity({ member });
  const activities = await listActivitiesIn365Days({ member });

  const metrics = await getMemberMetrics({ activities, today });
  const { pulse, presence, level } = metrics;

  const weekIntervals = eachWeekOfInterval(
    {
      start: last365Days,
      end: endOfDay(today),
    },
    { weekStartsOn: 1 },
  );

  const logs: Log[] = await Promise.all(
    weekIntervals.map(async (weekStart) => {
      const metrics = await getMemberMetrics({ activities, today: weekStart });
      return {
        date: weekStart.toISOString(),
        ...metrics,
      };
    }),
  );

  await prisma.members.update({
    where: {
      id,
      workspace_id,
    },
    data: {
      pulse,
      presence,
      level,
      logs,
      first_activity: firstActivity?.created_at,
      last_activity: activities.at(-1)?.created_at,
    },
  });
};
