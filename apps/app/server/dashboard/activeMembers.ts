import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const activeMembers = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { from, to } = input;

    const _from = format(from, "yyyy-MM-dd HH:mm:ss");
    const _to = format(to, "yyyy-MM-dd HH:mm:ss");

    const difference = differenceInDays(_to, _from);
    const previousFrom = subDays(_from, difference);
    const previousTo = subDays(_to, difference);

    const _previousFrom = format(previousFrom, "yyyy-MM-dd HH:mm:ss");
    const _previousTo = format(previousTo, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH 
          (
            SELECT count(DISTINCT member_id)
            FROM activity
            WHERE created_at >= '${_from}' 
            AND created_at <= '${_to}'
            AND workspace_id = '${workspace_id}'
          ) as current_count,
          (
            SELECT count(DISTINCT member_id)
            FROM activity
            WHERE created_at >= '${_previousFrom}' 
            AND created_at <= '${_previousTo}'
            AND workspace_id = '${workspace_id}'
          ) as previous_count
        SELECT 
          current_count as current,
          previous_count as previous,
          if(previous_count = 0, 0, ((current_count - previous_count) / previous_count) * 100) as variation
      `,
      format: "JSON",
    });

    const { data } = (await result.json()) as {
      data: Array<{ current: number; previous: number; variation: number }>;
    };

    return {
      current: data[0]?.current ?? 0,
      previous: data[0]?.previous ?? 0,
      variation: data[0]?.variation ?? 0,
    };
  });
