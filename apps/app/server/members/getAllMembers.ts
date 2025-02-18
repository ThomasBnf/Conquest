import { getFilters } from "@conquest/db/helpers/getFilters";
import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { prisma } from "@conquest/db/prisma";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
      page: z.number(),
      pageSize: z.number(),
      groupFilters: GroupFiltersSchema,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, id, desc, page, pageSize, groupFilters } = input;
    const { operator } = groupFilters;

    const searchParsed = search.toLowerCase().trim();
    const orderBy = orderByParser({ id, desc, type: "members" });
    const filterBy = getFilters({ groupFilters });

    const members = await prisma.$queryRaw`
      WITH profile_sources AS (
        SELECT 
          member_id,
          jsonb_agg(DISTINCT attributes->>'source') as sources
        FROM profile
        WHERE workspace_id = ${workspace_id}
        GROUP BY member_id
      )
      SELECT 
        m.*,
        l.number,
        ps.sources as profile_sources
      FROM member m
      LEFT JOIN level l ON m.level_id = l.id
      LEFT JOIN profile_sources ps ON m.id = ps.member_id
      LEFT JOIN company c ON m.company_id = c.id
      WHERE 
        (
          LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
          OR LOWER(COALESCE(m.last_name, '') || ' ' || COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
          OR LOWER(m.primary_email) LIKE '%' || ${searchParsed} || '%'
        )
        AND m.workspace_id = ${workspace_id}
        ${
          filterBy.length > 0
            ? Prisma.sql`AND (${Prisma.join(filterBy, operator === "OR" ? " OR " : " AND ")})`
            : Prisma.sql``
        }
      GROUP BY m.id, l.number, c.name, ps.sources
      ${Prisma.sql([orderBy])}
      LIMIT ${pageSize}
      OFFSET ${page * pageSize}
    `;

    return MemberSchema.array().parse(members);
  });
