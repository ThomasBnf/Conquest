import { client } from "@conquest/clickhouse/client";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { addHours, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listDayActivities = protectedProcedure
  .input(
    z.object({
      date: z.date(),
      member_id: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { date, member_id } = input;

    const adjustedDate = addHours(date, 1);

    const result = await client.query({
      query: `
        SELECT 
        a.*,
        activity_type.*
        FROM activity a
        LEFT JOIN activity_type ON a.activity_type_id = activity_type.id
        WHERE a.workspace_id = '${workspace_id}'
          AND toDate(a.created_at) = '${format(adjustedDate, "yyyy-MM-dd")}'
          ${member_id ? `AND a.member_id = '${member_id}'` : ""}
        ORDER BY a.created_at DESC
      `,
      format: "JSON",
    });

    const { data } = await result.json();

    if (!data?.length) return [];

    const transformFlatActivity = (row: Record<string, unknown>) => {
      const result: Record<string, unknown> = {};
      const activityType: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(row)) {
        if (key.startsWith("activity_type.")) {
          activityType[key.substring(14)] = value;
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

      result.activity_type = activityType;
      return result;
    };

    const activities = data.map((row: unknown) =>
      transformFlatActivity(row as Record<string, unknown>),
    );

    if (!activities?.length) return [];
    return ActivityWithTypeSchema.array().parse(activities);
  });
