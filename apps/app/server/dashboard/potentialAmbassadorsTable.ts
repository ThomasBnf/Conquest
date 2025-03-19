import { client } from "@conquest/clickhouse/client";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { addHours, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const potentialAmbassadorsTable = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
      page: z.number(),
      pageSize: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { from, to, search, id, desc, page, pageSize } = input;

    const orderBy = orderByParser({ id, desc, type: "members" });

    const _from = format(addHours(from, 1), "yyyy-MM-dd HH:mm:ss");
    const _to = format(addHours(to, 1), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT m.*
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        WHERE m.workspace_id = '${workspace_id}'
          AND l.number >= 7
          AND l.number < 10
          AND m.id IN (
            SELECT member_id 
            FROM activity 
            WHERE workspace_id = '${workspace_id}'
            AND created_at BETWEEN '${_from}' AND '${_to}'
          )
        AND (
          positionCaseInsensitive(concat(toString(first_name), ' ', toString(last_name)), '${search}') > 0
          OR positionCaseInsensitive(concat(toString(last_name), ' ', toString(first_name)), '${search}') > 0
          OR positionCaseInsensitive(toString(primary_email), '${search}') > 0
        )
        ${orderBy}
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    return MemberSchema.array().parse(data);
  });
