import { client } from "@conquest/clickhouse/client";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listFilteredCompanies = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { cursor, search, id, desc } = input;

    const searchParsed = search.toLowerCase().trim();
    const orderBy = orderByParser({ id, desc, type: "companies" });

    const result = await client.query({
      query: `
        SELECT *
        FROM company c
        WHERE (
          ${searchParsed ? `positionCaseInsensitive(c.name, '${searchParsed}') > 0` : "true"}
        )
        AND c.workspace_id = '${workspace_id}'
        ${orderBy}
        ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
      `,
    });

    const { data } = await result.json();
    return CompanySchema.array().parse(data);
  });
