import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listCompanies = protectedProcedure
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

    const result = await client.query({
      query: `
        SELECT *
        FROM company c
        WHERE (
          ${searchParsed ? `positionCaseInsensitive(c.name, '${searchParsed}') > 0` : "true"}
        )
        AND c.workspace_id = '${workspace_id}'
        ${orderBy}
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}
      `,
    });

    const { data } = await result.json();
    return CompanySchema.array().parse(data);
  });
