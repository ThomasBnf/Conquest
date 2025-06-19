import { deleteManyMembers as _deleteManyMembers } from "@conquest/db/member/deleteManyMembers";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteManyMembers = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .mutation(async ({ input }) => {
    const { ids } = input;

    return await _deleteManyMembers({ ids });
  });
