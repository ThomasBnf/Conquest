import { deleteManyCompanies as _deleteManyCompanies } from "@conquest/clickhouse/company/deleteManyCompanies";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteManyCompanies = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .mutation(async ({ input }) => {
    const { ids } = input;

    return await _deleteManyCompanies({ ids });
  });
