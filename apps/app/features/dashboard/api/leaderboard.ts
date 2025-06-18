import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import z from "zod";

type MinimalActivityType = {
  key: string;
  points: number;
  conditions: unknown;
};

type MemberActivities = {
  member: Member;
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

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");

    const activitiesResult = await client.query({
      query: `
        SELECT
          a.*,
          a.memberId as "memberId",
          at.key as "activityType.key",
          at.points as "activityType.points",
          at.conditions as "activityType.conditions",
          m.id as "member.id",
          m.workspaceId as "member.workspaceId",
          m.firstName as "member.firstName",
          m.lastName as "member.lastName",
          m.primaryEmail as "member.primaryEmail",
          m.emails as "member.emails",
          m.phones as "member.phones",
          m.jobTitle as "member.jobTitle",
          m.avatarUrl as "member.avatarUrl",
          m.country as "member.country",
          m.language as "member.language",
          m.tags as "member.tags",
          m.linkedinUrl as "member.linkedinUrl",
          m.levelId as "member.levelId",
          m.pulse as "member.pulse",
          m.source as "member.source",
          m.atRiskMember as "member.atRiskMember",
          m.potentialAmbassador as "member.potentialAmbassador",
          m.customFields as "member.customFields",
          m.companyId as "member.companyId",
          m.isStaff as "member.isStaff",
          m.firstActivity as "member.firstActivity",
          m.lastActivity as "member.lastActivity",
          m.createdAt as "member.createdAt",
          m.updatedAt as "member.updatedAt"
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
        const memberFields: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          if (k.startsWith("member.")) {
            memberFields[k.replace("member.", "")] = v;
          }
        }

        activitiesByMember[key] = {
          member: memberFields as Member,
          activities: [],
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
      .map(({ member, activities }) => ({
        ...member,
        pulse: getPulseScore({ activities }),
      }))
      .sort((a, b) => b.pulse - a.pulse)
      .slice(0, 10);
  });
