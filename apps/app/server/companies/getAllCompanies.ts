import { client } from "@conquest/clickhouse/client";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllCompanies = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.string().nullish(),
      take: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, cursor, take } = input;

    const companies = await client.query({
      query: `
        SELECT *
        FROM companies
        WHERE workspace_id = '${workspace_id}'
          AND name ILIKE '%${search}%'
          ${cursor ? `AND id > '${cursor}'` : ""}
        ORDER BY name ASC
        LIMIT ${take}
      `,
    });

    const results = await companies.json();
    return CompanySchema.array().parse(results);
  });
