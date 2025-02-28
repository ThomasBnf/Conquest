import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
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

    const result = await client.query({
      query: `
        SELECT count(*) as total
        FROM companies AS c
        WHERE (
          ${searchParsed ? `positionCaseInsensitive(c.name, '${searchParsed}') > 0` : "true"}
        )
        AND c.workspace_id = '${workspace_id}'
      `,
    });

    const { data } = await result.json();
    const count = data as Array<{ total: number }>;
    return Number(count[0]?.total);
  });
