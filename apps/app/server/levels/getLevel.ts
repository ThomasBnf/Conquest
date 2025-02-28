import { getLevel as _getLevel } from "@conquest/clickhouse/levels/getLevel";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getLevel = protectedProcedure
  .input(
    z.object({
      pulse: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { pulse } = input;

    return _getLevel({ pulse, workspace_id });
  });
