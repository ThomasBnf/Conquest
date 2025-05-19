import { listLogs as _listLogs } from "@conquest/clickhouse/log/listLogs";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listLogs = protectedProcedure
  .input(
    z.object({
      memberId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { memberId } = input;

    return await _listLogs({ memberId });
  });
