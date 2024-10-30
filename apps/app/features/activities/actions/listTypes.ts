"use server";

import { ActivitySchema } from "@conquest/zod/activity.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const listTypes = authAction
  .metadata({
    name: "listTypes",
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
      if (!uniqueTypes.includes(activityType)) {
        uniqueTypes.push(activityType);
      }
      return uniqueTypes;
    }, []);
  });
