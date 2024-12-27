import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { isAfter, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { getMemberPresence } from "./getMemberPresence";

type Props = {
  activities: ActivityWithType[];
};

export const getMemberLevel = async ({ activities }: Props) => {
  const today = new Date();
  const last3months = startOfMonth(subMonths(today, 3));
  const currentWeek = startOfWeek(today);

  const last3monthsActivities = activities.filter((activity) =>
    isAfter(activity.created_at, last3months),
  );

  const pulse = last3monthsActivities.reduce(
    (acc, activity) => acc + activity.activity_type.weight,
    0,
  );

  const maxWeight = Math.max(
    ...last3monthsActivities.map((activity) => activity.activity_type.weight),
    0,
  );

  const presence = getMemberPresence(activities, currentWeek);
  const level = Math.max(maxWeight, presence);

  return {
    pulse,
    presence,
    level,
  };
};
