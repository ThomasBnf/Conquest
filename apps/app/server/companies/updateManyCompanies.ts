import { updateCompany } from "@conquest/db/company/updateCompany";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateManyCompanies = protectedProcedure
  .input(
    z.object({
      companies: CompanySchema.array(),
    }),
  )
  .mutation(async ({ input }) => {
    const { companies } = input;

    for (const company of companies) {
      await updateCompany(company);
    }
  });
