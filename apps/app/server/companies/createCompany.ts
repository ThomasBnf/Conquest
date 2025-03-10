import { FormCreateSchema } from "@/features/companies/schema/company-form.schema";
import { createCompany as _createCompany } from "@conquest/clickhouse/companies/createCompany";
import { protectedProcedure } from "../trpc";

export const createCompany = protectedProcedure
  .input(FormCreateSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    return await _createCompany({ ...input, workspace_id });
  });
