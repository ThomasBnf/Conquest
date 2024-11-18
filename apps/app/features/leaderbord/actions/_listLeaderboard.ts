"use server";

import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import {
  type Integration,
  IntegrationSchema,
} from "@conquest/zod/integration.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const _listLeaderboard = authAction
  .metadata({ name: "_listLeaderboard" })
  .schema(
    z.object({
      page: z.number().default(0),
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ ctx, parsedInput: { page, from, to } }) => {
    const workspace_id = ctx.user.workspace_id;

    const members = await prisma.member.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
        activities: {
          some: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
      include: {
        activities: {
          where: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
      orderBy: {
        activities: {
          _count: "desc",
        },
      },
      take: 50,
      skip: (page - 1) * 50,
    });

    const parsedMembers = MemberWithActivitiesSchema.array().parse(members);

    const integrations = await prisma.integration.findMany({
      where: {
        workspace_id,
      },
    });
    const parsedIntegrations = IntegrationSchema.array().parse(integrations);

    const membersWithPoints = parsedMembers.map((member) => ({
      ...member,
      points: calculatePoints(member.activities, parsedIntegrations),
    }));

    return membersWithPoints.sort((a, b) => b.points - a.points);
  });

const calculatePoints = (
  activities: MemberWithActivities["activities"],
  integrations: Integration[],
): number => {
  return integrations.reduce((totalPoints, integration) => {
    const pointsConfig = integration.details.points_config;

    const integrationPoints = activities.reduce((total, activity) => {
      switch (activity.details.type) {
        case "POST":
          return total + (pointsConfig?.post ?? 0);
        case "REACTION":
          return total + (pointsConfig?.reaction ?? 0);
        case "REPLY":
          return total + (pointsConfig?.reply ?? 0);
        case "INVITATION":
          return total + (pointsConfig?.invitation ?? 0);
        default:
          return total;
      }
    }, 0);

    return totalPoints + integrationPoints;
  }, 0);
};
