import { cancelRun as _cancelRun } from "@/features/runs/api/cancelRun";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const cancelRun = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return await _cancelRun(input);
  });
