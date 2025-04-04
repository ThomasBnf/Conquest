import { client } from "@conquest/clickhouse/client";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const activeMembersTable = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      from: z.date(),
      to: z.date(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { cursor, from, to, search, id, desc } = input;

    const orderBy = orderByParser({ id, desc, type: "members" });

    const timeZone = "Europe/Paris";
    const fromInParis = toZonedTime(from, timeZone);
    const toInParis = toZonedTime(to, timeZone);

    const _from = format(fromInParis, "yyyy-MM-dd HH:mm:ss");
    const _to = format(toInParis, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT DISTINCT m.*
        FROM member m FINAL
        INNER JOIN activity a ON m.id = a.member_id
        LEFT JOIN level l ON m.level_id = l.id
        WHERE 
          m.workspace_id = '${workspace_id}'
          AND a.created_at BETWEEN '${_from}' AND '${_to}'
          AND (
            positionCaseInsensitive(concat(toString(first_name), ' ', toString(last_name)), '${search}') > 0
            OR positionCaseInsensitive(concat(toString(last_name), ' ', toString(first_name)), '${search}') > 0
            OR positionCaseInsensitive(toString(primary_email), '${search}') > 0
          )
        ${orderBy}
        ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
      `,
      format: "JSON",
    });

    const { data } = await result.json();

    const transformFlatActivity = (row: Record<string, unknown>) => {
      const result: Record<string, unknown> = {};
      const activityType: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(row)) {
        if (key.startsWith("m.")) {
          result[key.substring(2)] = value;
        } else {
          result[key] = value;
        }
      }

      result.activity_type = activityType;
      return result;
    };

    const members = data.map((row: unknown) =>
      transformFlatActivity(row as Record<string, unknown>),
    );

    return MemberSchema.array().parse(members);
  });
