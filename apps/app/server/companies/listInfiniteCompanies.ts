import { client } from "@conquest/clickhouse/client";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listInfiniteCompanies = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      search: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { cursor, search } = input;

    const searchParsed = search.toLowerCase().trim();

    const result = await client.query({
      query: `
        SELECT *
        FROM company c
        WHERE (
          ${searchParsed ? `positionCaseInsensitive(c.name, '${searchParsed}') > 0` : "true"}
        )
        AND c.workspace_id = '${workspace_id}'
        ORDER BY c.name ASC, c.id ASC
        ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
      `,
    });

    const { data } = await result.json();
    return CompanySchema.array().parse(data);
  });
