import { deleteMember as _deleteMember } from "@conquest/clickhouse/members/deleteMember";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteMember = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return await _deleteMember({ id });
  });
