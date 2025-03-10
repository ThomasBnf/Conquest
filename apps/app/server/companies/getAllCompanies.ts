import { client } from "@conquest/clickhouse/client";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllCompanies = protectedProcedure
  .input(
    z.object({
      search: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search } = input;

    const companies = await client.query({
      query: `
        SELECT *
        FROM company
        WHERE workspace_id = '${workspace_id}'
        ${search ? `AND name ILIKE '%${search}%'` : ""}
        ORDER BY name ASC
      `,
    });

    const { data } = await companies.json();
    return CompanySchema.array().parse(data);
  });
