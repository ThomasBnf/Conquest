import { client } from "@conquest/clickhouse/client";
import { format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const totalMembers = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    const formatedFrom = format(from, "yyyy-MM-dd");
    const formatedTo = format(to, "yyyy-MM-dd");

    console.log(formatedFrom, formatedTo);

    const result = await client.query({
      query: `
        SELECT COUNT(*) as total
        FROM members
        WHERE workspace_id = '${workspace_id}'
        AND created_at >= '${formatedFrom}' AND created_at <= '${formatedTo}'
      `,
    });

    const { data } = await result.json();
    const count = data as Array<{ total: number }>;

    console.log(data);

    return {
      totalMembers: Number(count[0]?.total),
      totalMembersData: [],
    };
  });
