import { FormCreateSchema } from "@/features/companies/schema/company-form.schema";
import { createCompany as _createCompany } from "@conquest/db/company/createCompany";
import { protectedProcedure } from "../trpc";

export const createCompany = protectedProcedure
  .input(FormCreateSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    return await _createCompany({ ...input, workspaceId });
  });
