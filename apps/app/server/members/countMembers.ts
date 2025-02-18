import { getFilters } from "@conquest/db/helpers/getFilters";
import { prisma } from "@conquest/db/prisma";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const countMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      groupFilters: GroupFiltersSchema,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, groupFilters } = input;
    const { operator } = groupFilters;

    const searchParsed = search?.toLowerCase().trim();
    const filterBy = getFilters({ groupFilters });

    const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>`
        WITH profile_sources AS (
          SELECT 
            member_id,
            jsonb_agg(DISTINCT attributes->>'source') as sources
          FROM profile
          WHERE workspace_id = ${workspace_id}
          GROUP BY member_id
        )
        SELECT COUNT(DISTINCT m.id)::bigint as count
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        LEFT JOIN profile_sources ps ON m.id = ps.member_id
        LEFT JOIN company c ON m.company_id = c.id
        WHERE 
          (
            LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(COALESCE(m.last_name, '') || ' ' || COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(m.primary_email) LIKE '%' || ${searchParsed} || '%'
            OR EXISTS (
              SELECT 1 FROM unnest(m.phones) phone
              WHERE LOWER(phone) LIKE '%' || ${searchParsed} || '%'
            )
          )
          AND m.workspace_id = ${workspace_id}
          ${
            filterBy.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterBy, operator === "OR" ? " OR " : " AND ")})`
              : Prisma.sql``
          }
      `;

    return Number(count);
  });
