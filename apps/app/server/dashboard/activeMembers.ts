import { client } from "@conquest/clickhouse/client";
import { format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const activeMembers = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ input }) => {
    const { from, to } = input;

    const formatedFrom = format(from, "yyyy-MM-dd");
    const formatedTo = format(to, "yyyy-MM-dd");

    const result = await client.query({
      query: `
          WITH date_series AS ( 
              SELECT formatDateTime(date_trunc('day', addDays(toDate('${formatedFrom}'), number)), '%b %d') AS date 
              FROM numbers(toUInt32(toDate('${formatedTo}') - toDate('${formatedFrom}') + 1)) 
          ), 
          active_members AS ( 
              SELECT 
                  formatDateTime(date_trunc('day', created_at), '%b %d') AS date, 
                  COUNT(DISTINCT member_id) AS active_members 
              FROM 
                  activities 
              WHERE 
                  created_at >= toDateTime('${formatedFrom}') AND created_at < toDateTime('${formatedTo}') + INTERVAL 1 DAY 
              GROUP BY 
                  formatDateTime(date_trunc('day', created_at), '%b %d')
          ) 
          SELECT 
              ds.date AS date, 
              COALESCE(am.active_members, 0) AS active_members 
          FROM 
              date_series ds 
          LEFT JOIN 
              active_members am ON ds.date = am.date 
          ORDER BY 
              ds.date ASC;
      `,
    });

    const { data } = await result.json();

    const resultActiveMembers = await client.query({
      query: `
        SELECT COUNT(DISTINCT member_id) AS total 
        FROM activities 
        WHERE created_at >= toDateTime('${formatedFrom}') AND created_at < toDateTime('${formatedTo}') + INTERVAL 1 DAY 
      `,
    });

    const { data: dateCount } = await resultActiveMembers.json();
    const count = dateCount as Array<{ total: number }>;

    return {
      activeMembers: Number(count[0]?.total),
      activeMembersData: data,
    };
  });
