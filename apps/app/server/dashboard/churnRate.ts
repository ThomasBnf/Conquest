import { client } from "@conquest/clickhouse/client";
import { format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const churnRate = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { from, to } = input;

    const previousPeriodLength = Math.abs(to.getTime() - from.getTime());
    const previousFrom = new Date(from.getTime() - previousPeriodLength);
    const previousTo = new Date(to.getTime() - previousPeriodLength);

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousFrom = format(previousFrom, "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousTo = format(previousTo, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH 
          high_level_members AS (
            SELECT 
              m.id
            FROM member m
            JOIN level l ON m.level_id = l.id
            WHERE m.workspace_id = '${workspace_id}'
              AND l.number >= 3
          ),
          activity_periods AS (
            SELECT 
              member_id,
              toInt8(countIf(created_at BETWEEN '${formattedFrom}' AND '${formattedTo}') > 0) AS active_current,
              toInt8(countIf(created_at BETWEEN '${formattedPreviousFrom}' AND '${formattedPreviousTo}') > 0) AS active_previous
            FROM activity
            WHERE workspace_id = '${workspace_id}'
              AND created_at >= '${formattedPreviousFrom}' 
              AND created_at <= '${formattedTo}'
              AND member_id IN (SELECT id FROM high_level_members)
            GROUP BY member_id
          ),
          member_stats AS (
            SELECT
              COUNT(h.id) AS total_members,
              SUM(CASE WHEN a.member_id IS NULL OR a.active_current = 0 THEN 1 ELSE 0 END) AS current_inactive,
              SUM(CASE WHEN a.member_id IS NULL OR a.active_previous = 0 THEN 1 ELSE 0 END) AS previous_inactive
            FROM high_level_members h
            LEFT JOIN activity_periods a ON h.id = a.member_id
          )
        
        SELECT 
          (current_inactive / nullIf(total_members, 0)) * 100 AS current,
          (previous_inactive / nullIf(total_members, 0)) * 100 AS previous,
          ((current_inactive / nullIf(total_members, 0)) - (previous_inactive / nullIf(total_members, 0))) * 100 AS variation_rate
        FROM member_stats
      `,
      format: "JSON",
    });

    const { data } = (await result.json()) as {
      data: Array<{
        current: number;
        previous: number;
        variation_rate: number;
      }>;
    };

    return {
      current: data[0]?.current ?? 0,
      previous: data[0]?.previous ?? 0,
      variation: data[0]?.variation_rate ?? 0,
    };
  });
