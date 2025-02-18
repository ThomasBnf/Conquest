import { getFilters } from "@conquest/db/helpers/getFilters";
import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllCompanies = protectedProcedure
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
    const orderBy = orderByParser({ id, desc, type: "companies" });
    const filterBy = getFilters({ groupFilters });

    const companies = await prisma.$queryRaw`
      SELECT *
      FROM company c
      WHERE 
        (LOWER(c.name) LIKE '%' || ${searchParsed} || '%')
        AND c.workspace_id = ${workspace_id}
        ${
          filterBy.length > 0
            ? Prisma.sql`AND (${Prisma.join(filterBy, operator === "OR" ? " OR " : " AND ")})`
            : Prisma.sql``
        }
      ${Prisma.sql([orderBy])}
      LIMIT ${pageSize}
      OFFSET ${page * pageSize}
    `;

    return CompanySchema.array().parse(companies);
  });
