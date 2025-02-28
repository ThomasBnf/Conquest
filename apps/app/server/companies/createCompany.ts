import { createCompany as _createCompany } from "@conquest/clickhouse/companies/createCompany";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createCompany = protectedProcedure
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { name } = input;

    return await _createCompany({ name, workspace_id });
  });
