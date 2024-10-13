"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { ActivitySchema } from "schemas/activity.schema";

export const listActivitySource = authAction
  .metadata({
    name: "listActivitySource",
  })
  .action(async ({ ctx }) => {
    const activities = await prisma.activity.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    const parsedActivities = ActivitySchema.array().parse(activities);

    return parsedActivities.reduce<string[]>((uniqueSources, activity) => {
      const activitySource = activity.details.source;
      if (!uniqueSources.includes(activitySource)) {
        uniqueSources.push(activitySource);
      }
      return uniqueSources;
    }, []);
  });
