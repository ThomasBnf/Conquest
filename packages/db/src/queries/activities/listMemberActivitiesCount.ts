import {
  eachDayOfInterval,
  endOfToday,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import { prisma } from "../../prisma";

type Props = {
  member_id: string;
  workspace_id: string;
};

export const listMemberActivitiesCount = async ({
  member_id,
  workspace_id,
}: Props) => {
  const today = new Date();
  const from = startOfDay(subDays(today, 365));
  const to = endOfToday();

  const intervalDay = eachDayOfInterval({
    start: from,
    end: to,
  });

  const activities = await prisma.activities.findMany({
    where: {
      member_id,
      workspace_id,
      created_at: {
        gte: from,
        lte: to,
      },
    },
    include: {
      activity_type: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const activitiesPerDay = intervalDay.map((day) => {
    const dayActivities = activities.filter((activity) =>
      isSameDay(activity.created_at, day),
    );
    return {
      date: day,
      activities: dayActivities,
    };
  });

  return activitiesPerDay;
};
