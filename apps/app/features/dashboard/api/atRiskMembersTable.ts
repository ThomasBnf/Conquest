// import { client } from "@conquest/clickhouse/client";
// import { cleanPrefix } from "@conquest/clickhouse/helpers/cleanPrefix";
// import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
// import { FullMemberSchema } from "@conquest/zod/schemas/member.schema";
// import { format } from "date-fns";
// import { toZonedTime } from "date-fns-tz";
// import { z } from "zod";
// import { protectedProcedure } from "../../../server/trpc";

// export const atRiskMembersTable = protectedProcedure
//   .input(
//     z.object({
//       cursor: z.number().nullish(),
//       dateRange: z
//         .object({
//           from: z.coerce.date().optional(),
//           to: z.coerce.date().optional(),
//         })
//         .optional(),
//       search: z.string(),
//       id: z.string(),
//       desc: z.boolean(),
//     }),
//   )
//   .query(async ({ ctx: { user }, input }) => {
//     const { workspaceId } = user;
//     const { cursor, dateRange, search, id, desc } = input;
//     const { from, to } = dateRange ?? {};

//     if (!from || !to) {
//       return [];
//     }

//     const orderBy = orderByParser({ id, desc, type: "members" });

//     const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
//     const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");

//     const result = await client.query({
//       query: `
//         SELECT
//           m.*,
//           c.name as company,
//           l.number as level,
//           l.name as levelName,
//           p.attributes
//         FROM member m FINAL
//         LEFT JOIN level l ON m.levelId = l.id
//         LEFT JOIN company c ON m.companyId = c.id
//         LEFT JOIN (
//           SELECT
//             memberId,
//             groupArray(attributes) as attributes
//           FROM profile FINAL
//           GROUP BY memberId
//         ) p ON m.id = p.memberId
//         WHERE
//           m.workspaceId = '${workspaceId}'
//           AND m.isStaff = 0
//           AND m.pulse >= 20
//           AND m.id NOT IN (
//             SELECT memberId
//             FROM activity
//             WHERE workspaceId = '${workspaceId}'
//             AND createdAt BETWEEN '${formattedFrom}' AND '${formattedTo}'
//           )
//         ${
//           search
//             ? `AND (
//                 positionCaseInsensitive(concat(firstName, ' ', lastName), LOWER(trim('${search}'))) > 0
//                 OR positionCaseInsensitive(primaryEmail, LOWER(trim('${search}'))) > 0
//                 OR arrayExists(attr -> attr.source = 'Github' AND positionCaseInsensitive(toString(attr.login), LOWER(trim('${search}'))) > 0, p.attributes)
//               )`
//             : ""
//         }
//         ${orderBy}
//         ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
//       `,
//       format: "JSON",
//     });

//     const { data } = await result.json();
//     const cleanData = cleanPrefix("m.", data);
//     return FullMemberSchema.array().parse(cleanData);
//   });
