import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
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
  .query(async ({ input }) => {
    const { from, to } = input;

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT 
          m.*,
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        WHERE l.number > 3
        AND m.last_activity <= '${formattedFrom}'
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    return MemberSchema.array().parse(data);
  });
