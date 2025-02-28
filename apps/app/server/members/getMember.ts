import { getMember as _getMember } from "@conquest/clickhouse/members/getMember";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getMember = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      source: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { id, source } = input;

    if (source) {
    }

    return await _getMember({ id });
  });
