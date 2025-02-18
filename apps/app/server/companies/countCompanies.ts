import { getFilters } from "@conquest/db/helpers/getFilters";
import { prisma } from "@conquest/db/prisma";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";
export const countCompanies = protectedProcedure
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

    const searchParsed = search.toLowerCase().trim();
    const filterBy = getFilters({ groupFilters });

    const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM company c
    WHERE 
      (LOWER(c.name) LIKE '%' || ${searchParsed} || '%')
      AND c.workspace_id = ${workspace_id}
      ${
        filterBy.length > 0
          ? Prisma.sql`AND (${Prisma.join(filterBy, operator === "OR" ? " OR " : " AND ")})`
          : Prisma.sql``
      }
    `;

    return Number(count);
  });
