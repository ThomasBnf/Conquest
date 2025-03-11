import { client } from "@conquest/clickhouse/client";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const atRiskMembersTable = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { from, to, search, id, desc } = input;

    const orderBy = orderByParser({ id, desc, type: "members" });

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT m.*
        FROM member m
        JOIN level l ON m.level_id = l.id
        LEFT JOIN (
          SELECT DISTINCT member_id
          FROM activity
          WHERE workspace_id = '${workspace_id}'
            AND created_at BETWEEN '${formattedFrom}' AND '${formattedTo}'
        ) a ON m.id = a.member_id
        WHERE m.workspace_id = '${workspace_id}'
          AND l.number >= 3
          AND a.member_id IS NULL
          ${
            search
              ? `AND (
            positionCaseInsensitive(concat(toString(m.first_name), ' ', toString(m.last_name)), '${search}') > 0
            OR positionCaseInsensitive(concat(toString(m.last_name), ' ', toString(m.first_name)), '${search}') > 0
            OR positionCaseInsensitive(toString(m.primary_email), '${search}') > 0
          )`
              : ""
          }
        ${orderBy}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    return MemberSchema.array().parse(data);
  });
