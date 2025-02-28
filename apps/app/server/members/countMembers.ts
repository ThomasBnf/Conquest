import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
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

    const searchParsed = search?.toLowerCase().trim();
    const filterBy = getFilters({ groupFilters });

    const result = await client.query({
      query: `
        SELECT count(*) as total
        FROM members AS m
        LEFT JOIN levels AS l ON m.level_id = l.id
        LEFT JOIN companies AS c ON m.company_id = c.id
        WHERE (
          ${
            searchParsed
              ? `
            positionCaseInsensitive(concat(COALESCE(m.first_name, ''), ' ', COALESCE(m.last_name, '')), '${searchParsed}') > 0
            OR positionCaseInsensitive(concat(COALESCE(m.last_name, ''), ' ', COALESCE(m.first_name, '')), '${searchParsed}') > 0
            OR positionCaseInsensitive(m.primary_email, '${searchParsed}') > 0
          `
              : "true"
          }
        )
        AND m.workspace_id = '${workspace_id}'
      `,
    });

    const { data } = await result.json();
    const count = data as Array<{ total: number }>;
    return Number(count[0]?.total);
  });
