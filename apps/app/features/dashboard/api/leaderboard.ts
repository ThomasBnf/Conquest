import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { format } from "date-fns";
import z from "zod";

type MinimalActivityType = {
  key: string;
  points: number;
  conditions: unknown;
};

type MemberActivities = {
  source: string;
  memberId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  activities: ActivityWithType[];
};

export const leaderboard = protectedProcedure
  .input(
    z.object({
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { dateRange, sources } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return [];
    }

    const formattedFrom = format(from, "yyyy-MM-dd");
    const formattedTo = format(to, "yyyy-MM-dd");

    const activitiesResult = await client.query({
      query: `
        SELECT
          a.*,
          a.memberId as "memberId",
          at.key as "activityType.key",
          at.points as "activityType.points",
          at.conditions as "activityType.conditions",
          m.firstName as "firstName",
          m.lastName as "lastName",
          m.avatarUrl as "avatarUrl"
        FROM activity a
        LEFT JOIN activityType at ON a.activityTypeId = at.id
        LEFT JOIN profile p ON a.memberId = p.id
        LEFT JOIN member m ON a.memberId = m.id
        WHERE a.workspaceId = '${workspaceId}'
          AND a.source IN (${sources.map((s) => `'${s}'`).join(",")})
          AND a.createdAt >= '${formattedFrom}'
          AND a.createdAt <= '${formattedTo}'
          AND at.id IS NOT NULL
      `,
    });

    const { data: activities } = await activitiesResult.json();
    const activitiesByMember: Record<string, MemberActivities> = {};

    for (const row of activities as Record<string, unknown>[]) {
      const key = `${row.source as string}__${row.memberId as string}`;

      if (!activitiesByMember[key]) {
        activitiesByMember[key] = {
          source: row.source as string,
          memberId: row.memberId as string,
          activities: [],
          firstName: row.firstName as string,
          lastName: row.lastName as string,
          avatarUrl: row.avatarUrl as string,
        };
      }

      if (
        typeof row["activityType.key"] === "string" &&
        typeof row["activityType.points"] === "number"
      ) {
        const activityType: MinimalActivityType = {
          key: row["activityType.key"] as string,
          points: row["activityType.points"] as number,
          conditions: row["activityType.conditions"],
        };

        activitiesByMember[key].activities.push({
          ...row,
          activityType,
        } as ActivityWithType);
      }
    }

    return Object.values(activitiesByMember)
      .map(
        ({ source, memberId, firstName, lastName, avatarUrl, activities }) => ({
          source,
          memberId,
          firstName,
          lastName,
          avatarUrl,
          pulseScore: getPulseScore({ activities }),
        }),
      )
      .sort((a, b) => b.pulseScore - a.pulseScore)
      .slice(0, 10);
  });
