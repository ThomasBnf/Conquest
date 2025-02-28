import { deleteActivity as _deleteActivity } from "@conquest/clickhouse/activities/deleteActivity";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteActivity = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return await _deleteActivity({ id });
  });
