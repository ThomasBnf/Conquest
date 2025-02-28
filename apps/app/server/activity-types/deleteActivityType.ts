import { deleteActivityType as _deleteActivityType } from "@conquest/clickhouse/activity-types/deleteActivityType";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteActivityType = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return await _deleteActivityType({ id });
  });
