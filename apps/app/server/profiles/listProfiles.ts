import { listProfiles as _listProfiles } from "@conquest/clickhouse/profiles/listProfiles";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listProfiles = protectedProcedure
  .input(
    z.object({
      member_id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { member_id } = input;
    return await _listProfiles({ member_id });
  });
