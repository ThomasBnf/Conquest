import { updateCompany as _updateCompany } from "@conquest/clickhouse/company/updateCompany";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { protectedProcedure } from "../trpc";

export const updateCompany = protectedProcedure
  .input(CompanySchema)
  .mutation(async ({ input }) => {
    return _updateCompany(input);
  });
