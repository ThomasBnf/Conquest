import { deleteList as _deleteList } from "@conquest/clickhouse/lists/deleteList";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteList = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return _deleteList({ id });
  });
