import { client } from "@conquest/clickhouse/client";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { endOfDay, format, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listDayActivities = protectedProcedure
  .input(
    z.object({
      date: z.coerce.date(),
      memberId: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { date, memberId } = input;

    const timeZone = "Europe/Paris";
    const dateInParis = toZonedTime(date, timeZone);

    const startDay = format(startOfDay(dateInParis), "yyyy-MM-dd HH:mm:ss");
    const endDay = format(endOfDay(dateInParis), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT 
          a.*,
          activityType.*
        FROM activity a
        LEFT JOIN activityType ON a.activityTypeId = activityType.id
        WHERE a.workspaceId = '${workspaceId}'
          AND a.createdAt >= '${startDay}'
          AND a.createdAt <= '${endDay}'
          ${memberId ? `AND a.memberId = '${memberId}'` : ""}
        ORDER BY a.createdAt DESC
      `,
      format: "JSON",
    });

    const { data } = await result.json();

    console.log("data", data);

    if (!data?.length) return [];

    const transformFlatActivity = (row: Record<string, unknown>) => {
      const result: Record<string, unknown> = {};
      const activityType: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(row)) {
        if (key.startsWith("activityType.")) {
          activityType[key.substring(13)] = value;
        } else if (
          ["name", "key", "points", "conditions", "deletable"].includes(key)
        ) {
          activityType[key] = value;
        } else if (key.startsWith("a.")) {
          result[key.substring(2)] = value;
        } else {
          result[key] = value;
        }
      }

      result.activityType = activityType;
      return result;
    };

    const activities = data.map((row: unknown) =>
      transformFlatActivity(row as Record<string, unknown>),
    );

    console.log("activities", activities);

    if (!activities?.length) return [];
    return ActivityWithTypeSchema.array().parse(activities);
  });
