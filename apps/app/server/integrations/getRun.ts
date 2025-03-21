import { getRun as _getRun } from "@conquest/trigger/getRun";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getRun = protectedProcedure
  .input(
    z.object({
      run_id: z.string().nullable().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { run_id } = input;

    if (!run_id) return null;

    return await _getRun({ run_id });
  });
