import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { startOfMonth, subMonths } from "date-fns";
import { Hono } from "hono";

export const members = new Hono().get("/:memberId/metrics", async (c) => {
  const { memberId } = c.req.param();
  const user = await getAuthUser(c);

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { workspace_id } = user;
  const last3months = startOfMonth(subMonths(new Date(), 3));

  const member = await prisma.members.findUnique({
    where: {
      id: memberId,
      activities: {
        some: {
          created_at: {
            gte: last3months,
          },
        },
      },
      workspace_id,
    },
    include: {
      activities: {
        where: {
          created_at: {
            gte: last3months,
          },
        },
        include: {
          activity_type: true,
        },
      },
    },
  });

  const activities = member?.activities ?? [];

  const activityCounts = activities.reduce<
    Record<string, { count: number; weight: number }>
  >((acc, activity) => {
    const { name } = activity.activity_type;
    const { weight } = activity.activity_type;

    if (!acc[name]) {
      acc[name] = { count: 0, weight };
    }
    acc[name].count++;
    return acc;
  }, {});

  const activityDetails = Object.entries(activityCounts)
    .map(([name, { count, weight }]) => ({
      activity_name: name,
      activity_count: count,
      weight,
    }))
    .sort((a, b) => b.weight - a.weight);

  const totalActivities = activities.length;
  const totalLove = activityDetails.reduce(
    (sum, { activity_count, weight }) => sum + activity_count * weight,
    0,
  );
  const maxWeight = Math.max(...activityDetails.map(({ weight }) => weight));

  return c.json({
    details: activityDetails,
    total_activities: totalActivities,
    total_love: totalLove,
    max_weight: maxWeight,
  });
});
