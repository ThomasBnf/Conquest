"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import {
  IntegrationSchema,
  type PointsConfig,
} from "@conquest/zod/integration.schema";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const _listMembers = authAction
  .metadata({ name: "_listMembers" })
  .schema(
    z.object({
      search: z.string(),
      page: z.number(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .action(
    async ({ ctx: { user }, parsedInput: { search, page, id, desc } }) => {
      const workspace_id = user.workspace_id;
      const orderBy = getOrderBy(id, desc);

      const members = await prisma.member.findMany({
        where: {
          search: { contains: search, mode: "insensitive" },
          workspace_id,
        },
        include: {
          activities: true,
        },
        orderBy,
        take: 50,
        skip: (page - 1) * 50,
      });

      const parsedMembers = MemberWithActivitiesSchema.array().parse(members);

      if (id === "last_activity") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByLastActivity(a, b) : -sortByLastActivity(a, b),
        );
      }

      if (id === "created_at") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByCreatedAt(a, b) : -sortByCreatedAt(a, b),
        );
      }

      if (id === "posts") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByPosts(a, b) : -sortByPosts(a, b),
        );
      }

      if (id === "replies") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByReplies(a, b) : -sortByReplies(a, b),
        );
      }

      if (id === "reactions") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByReactions(a, b) : -sortByReactions(a, b),
        );
      }

      if (id === "invitations") {
        return parsedMembers.sort((a, b) =>
          desc ? sortByInvitations(a, b) : -sortByInvitations(a, b),
        );
      }

      if (id === "points") {
        const integration = await prisma.integration.findFirst({
          where: {
            workspace_id,
            details: {
              path: ["source"],
              equals: parsedMembers[0]?.source,
            },
          },
        });
        const pointsConfig =
          IntegrationSchema.parse(integration)?.details.points_config;

        return parsedMembers.sort((a, b) => {
          const pointsA = calculatePoints(a.activities, pointsConfig);
          const pointsB = calculatePoints(b.activities, pointsConfig);
          return desc ? pointsB - pointsA : pointsA - pointsB;
        });
      }

      return parsedMembers;
    },
  );

const getOrderBy = (
  id: string,
  desc: boolean,
): Prisma.MemberOrderByWithRelationInput => {
  if (!id) {
    return { last_name: desc ? "desc" : "asc" };
  }

  if (
    id === "posts" ||
    id === "reactions" ||
    id === "replies" ||
    id === "invitations" ||
    id === "points" ||
    id === "last_activity" ||
    id === "created_at"
  ) {
    return {};
  }

  return { [id]: desc ? "desc" : "asc" };
};

const sortByLastActivity = (
  a: MemberWithActivities,
  b: MemberWithActivities,
) => {
  const lastActivityA = a.activities[0]?.created_at?.getTime() ?? 0;
  const lastActivityB = b.activities[0]?.created_at?.getTime() ?? 0;
  return lastActivityB - lastActivityA;
};

const sortByCreatedAt = (a: MemberWithActivities, b: MemberWithActivities) => {
  const joinedAtA = a.created_at?.getTime() ?? 0;
  const joinedAtB = b.created_at?.getTime() ?? 0;
  return joinedAtB - joinedAtA;
};

const sortByPosts = (a: MemberWithActivities, b: MemberWithActivities) => {
  const postsA = a.activities.filter(
    (activity) => activity.details.type === "POST",
  ).length;
  const postsB = b.activities.filter(
    (activity) => activity.details.type === "POST",
  ).length;
  return postsB - postsA;
};

const sortByReplies = (a: MemberWithActivities, b: MemberWithActivities) => {
  const repliesA = a.activities.filter(
    (activity) => activity.details.type === "REPLY",
  ).length;
  const repliesB = b.activities.filter(
    (activity) => activity.details.type === "REPLY",
  ).length;
  return repliesB - repliesA;
};

const sortByReactions = (a: MemberWithActivities, b: MemberWithActivities) => {
  const reactionsA = a.activities.filter(
    (activity) => activity.details.type === "REACTION",
  ).length;
  const reactionsB = b.activities.filter(
    (activity) => activity.details.type === "REACTION",
  ).length;
  return reactionsB - reactionsA;
};

const sortByInvitations = (
  a: MemberWithActivities,
  b: MemberWithActivities,
) => {
  const invitationsA = a.activities.filter(
    (activity) => activity.details.type === "INVITATION",
  ).length;
  const invitationsB = b.activities.filter(
    (activity) => activity.details.type === "INVITATION",
  ).length;
  return invitationsB - invitationsA;
};

const calculatePoints = (
  activities: MemberWithActivities["activities"],
  pointsConfig: PointsConfig,
) => {
  return activities.reduce((total, activity) => {
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
};
