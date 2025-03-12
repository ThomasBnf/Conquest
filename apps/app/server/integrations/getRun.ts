import { getRun as _getRun } from "@conquest/trigger/queries/getRun";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getRun = protectedProcedure
  .input(
    z.object({
      run_id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { run_id } = input;

    return await _getRun({ run_id });
  });
