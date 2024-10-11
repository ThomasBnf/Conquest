"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ActivitySchema } from "@/schemas/activity.schema";

export const listActivityType = authAction
  .metadata({
    name: "listActivityType",
  })
  .action(async ({ ctx }) => {
    const activities = await prisma.activity.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    const parsedActivities = ActivitySchema.array().parse(activities);

    return parsedActivities.reduce<string[]>((uniqueTypes, activity) => {
      const activityType = activity.details.type;
      return uniqueTypes.includes(activityType)
        ? uniqueTypes
        : [...uniqueTypes, activityType];
    }, []);
  });
