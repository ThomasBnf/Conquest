import { getProfile as _getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getProfile = protectedProcedure
  .input(
    z.object({
      external_id: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { external_id } = input;
    const { workspace_id } = user;

    return await _getProfile({ external_id, workspace_id });
  });
