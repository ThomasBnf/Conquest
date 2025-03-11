import { client } from "@conquest/clickhouse/client";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { endOfDay, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const activeMembersTable = protectedProcedure
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
    const formattedTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT m.*, l.name as level_name, l.color as level_color
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        WHERE m.workspace_id = '${workspace_id}'
        AND m.id IN (
          SELECT DISTINCT member_id
          FROM activity
          WHERE created_at BETWEEN '${formattedFrom}' AND '${formattedTo}'
          AND workspace_id = '${workspace_id}'
        )
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
