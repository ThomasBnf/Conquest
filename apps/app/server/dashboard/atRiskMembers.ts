import { client } from "@conquest/clickhouse/client";
import { format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const atRiskMembers = protectedProcedure
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
          active_members AS (
            SELECT 
              member_id,
              toInt8(max(created_at BETWEEN '${formattedFrom}' AND '${formattedTo}')) AS active_current,
              toInt8(max(created_at BETWEEN '${formattedPreviousFrom}' AND '${formattedPreviousTo}')) AS active_previous
            FROM activity
            WHERE workspace_id = '${workspace_id}'
              AND created_at >= '${formattedPreviousFrom}' 
              AND created_at <= '${formattedTo}'
            GROUP BY member_id
          ),
          high_level_members AS (
            SELECT 
              count() AS total,
              countIf(am.member_id IS NULL OR am.active_current = 0) AS current_at_risk,
              countIf(am.member_id IS NULL OR am.active_previous = 0) AS previous_at_risk
            FROM member m
            JOIN level l ON m.level_id = l.id
            LEFT JOIN active_members am ON m.id = am.member_id
            WHERE m.workspace_id = '${workspace_id}'
              AND l.number >= 3
          )
        
        SELECT 
          current_at_risk AS current,
          previous_at_risk AS previous,
          multiIf(
            previous_at_risk = 0 AND current_at_risk > 0, 100,
            previous_at_risk = 0, 0,
            ((current_at_risk - previous_at_risk) / previous_at_risk) * 100
          ) AS variation_rate
        FROM high_level_members
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
