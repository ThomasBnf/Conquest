import { getFilters } from "@conquest/db/helpers/getFilters";
import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { prisma } from "@conquest/db/prisma";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const atRiskMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
      page: z.number(),
      pageSize: z.number(),
      groupFilters: GroupFiltersSchema,
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, id, desc, page, pageSize, groupFilters, from, to } = input;
    const { operator } = groupFilters;

    const searchParsed = search.toLowerCase().trim();
    const orderBy = orderByParser({ id, desc, type: "members" });
    const filterBy = getFilters({ groupFilters });

    const count = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT m.id) as count
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        WHERE  
        (
          LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
          OR LOWER(COALESCE(m.last_name, '') || ' ' || COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
          OR LOWER(m.primary_email) LIKE '%' || ${searchParsed} || '%'
        )
        AND m.workspace_id = ${workspace_id}
        AND l.number >= 3
        AND NOT EXISTS (
          SELECT 1 
          FROM activity a 
          WHERE a.member_id = m.id
          AND a.created_at >= ${from}
          AND a.created_at <= ${to}
          )
          ${
            filterBy.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterBy, " AND ")})`
              : Prisma.sql``
          }
      `;

    const members = await prisma.$queryRaw`
        SELECT m.*
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        WHERE 
        (
          LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
          OR LOWER(COALESCE(m.last_name, '') || ' ' || COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
          OR LOWER(m.primary_email) LIKE '%' || ${searchParsed} || '%'
        )
        AND m.workspace_id = ${workspace_id}
          AND l.number >= 3
          AND NOT EXISTS (
            SELECT 1 
            FROM activity a 
            WHERE a.member_id = m.id
              AND a.created_at >= ${from}
              AND a.created_at <= ${to}
          )
          ${
            filterBy.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterBy, operator === "OR" ? " OR " : " AND ")})`
              : Prisma.sql``
          }
        GROUP BY m.id, l.number
        ${Prisma.sql([orderBy])}
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}
      `;

    return {
      members: MemberSchema.array().parse(members),
      count: Number(count[0].count),
    };
  });
