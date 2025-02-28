import { updateCompany as _updateCompany } from "@conquest/clickhouse/companies/updateCompany";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateCompany = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: CompanySchema.partial(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;

    return _updateCompany({ id, data });
  });
