import { deleteLevel as _deleteLevel } from "@conquest/clickhouse/level/deleteLevel";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteLevel = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return _deleteLevel({ id });
  });
