import { client } from "@conquest/clickhouse/client";
import { cleanPrefix } from "@conquest/clickhouse/helpers/cleanPrefix";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { FullMemberSchema } from "@conquest/zod/schemas/member.schema";
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
    const { workspaceId } = user;
    const { cursor, from, to, search, id, desc } = input;

    const orderBy = orderByParser({ id, desc, type: "members" });

    const timeZone = "Europe/Paris";
    const fromInParis = toZonedTime(from, timeZone);
    const toInParis = toZonedTime(to, timeZone);

    const _from = format(fromInParis, "yyyy-MM-dd HH:mm:ss");
    const _to = format(toInParis, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT DISTINCT
          m.*,
          c.name as company,
          l.number as level,
          l.name as levelName,
          p.attributes,
        FROM member m FINAL
        LEFT JOIN activity a ON m.id = a.memberId
        LEFT JOIN level l ON m.levelId = l.id
        LEFT JOIN company c ON m.companyId = c.id
        LEFT JOIN (
          SELECT 
            memberId,
            groupArray(attributes) as attributes
          FROM profile FINAL
          GROUP BY memberId
        ) p ON m.id = p.memberId
        WHERE 
          m.workspaceId = '${workspaceId}'
          AND m.isStaff = 0
          AND a.createdAt BETWEEN '${_from}' AND '${_to}'
          ${
            search
              ? `AND (
                positionCaseInsensitive(concat(firstName, ' ', lastName), LOWER(trim('${search}'))) > 0
                OR positionCaseInsensitive(primaryEmail, LOWER(trim('${search}'))) > 0
                OR arrayExists(attr -> attr.source = 'Github' AND positionCaseInsensitive(toString(attr.login), LOWER(trim('${search}'))) > 0, p.attributes)
              )`
              : ""
          }
        ${orderBy}
        ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const cleanData = cleanPrefix("m.", data);
    return FullMemberSchema.array().parse(cleanData);
  });
