import { getMember as _getMember } from "@conquest/db/member/getMember";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getMember = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    return await _getMember({ id });
  });
