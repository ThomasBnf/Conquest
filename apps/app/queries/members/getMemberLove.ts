import { prisma } from "@/lib/prisma";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { isAfter, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { getMemberPresence } from "../slack/getMemberPresence";

type Props = {
  memberId: string;
  activities: ActivityWithType[];
};

export const getMemberLove = async ({ memberId, activities }: Props) => {
  const today = new Date();
  const last3months = startOfMonth(subMonths(today, 3));
  const currentWeek = startOfWeek(today);

  if (!activities.length) {
    await prisma.members.update({
      where: { id: memberId },
      data: {
        love: 0,
        presence: 0,
        level: 0,
        logs: [],
      },
    });
  }

  const last3monthsActivities = activities.filter((activity) =>
    isAfter(activity.created_at, last3months),
  );

  const love = last3monthsActivities.reduce(
    (acc, activity) => acc + activity.activity_type.weight,
    0,
  );

  const maxWeight = Math.max(
    ...last3monthsActivities.map((activity) => activity.activity_type.weight),
    0,
  );

  const presence = getMemberPresence(activities, currentWeek);
  const level = Math.max(presence, maxWeight);

  return {
    love,
    presence,
    level,
  };
};
