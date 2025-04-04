import { client } from "@conquest/clickhouse/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const countCompanies = protectedProcedure
  .input(
    z.object({
      search: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search } = input;

    const searchParsed = search.toLowerCase().trim();

    const result = await client.query({
      query: `
        SELECT count(*) as total
        FROM company AS c
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
