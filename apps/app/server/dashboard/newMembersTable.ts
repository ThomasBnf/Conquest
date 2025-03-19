import { client } from "@conquest/clickhouse/client";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { addHours, endOfDay, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const newMembersTable = protectedProcedure
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

    const fromAdjusted = addHours(from, 1);
    const toAdjusted = addHours(to, 1);

    const formattedFrom = format(fromAdjusted, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(endOfDay(toAdjusted), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT m.*
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        WHERE m.workspace_id = '${workspace_id}'
          AND m.created_at BETWEEN '${formattedFrom}' AND '${formattedTo}'
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
