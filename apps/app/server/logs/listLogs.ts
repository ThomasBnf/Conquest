import { listLogs as _listLogs } from "@conquest/clickhouse/logs/listLogs";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listLogs = protectedProcedure
  .input(
    z.object({
      member_id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { member_id } = input;

    return await _listLogs({ member_id });
  });
