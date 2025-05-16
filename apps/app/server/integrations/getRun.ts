import { getRun as _getRun } from "@conquest/trigger/helpers/getRun";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getRun = protectedProcedure
  .input(
    z.object({
      runId: z.string().nullable().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { runId } = input;

    if (!runId) return null;

    return await _getRun({ runId });
  });
