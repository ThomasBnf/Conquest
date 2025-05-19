import { getCompany as _getCompany } from "@conquest/clickhouse/company/getCompany";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getCompany = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    return await _getCompany({ id });
  });
