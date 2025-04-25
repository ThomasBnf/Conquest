import { listProfiles as _listProfiles } from "@conquest/clickhouse/profiles/listProfiles";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listProfiles = protectedProcedure
  .input(
    z.object({
      memberId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { memberId } = input;

    return await _listProfiles({ memberId });
  });
