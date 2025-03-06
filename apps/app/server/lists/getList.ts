import { getList as _getList } from "@conquest/db/lists/getList";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getList = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    return _getList({ id });
  });
