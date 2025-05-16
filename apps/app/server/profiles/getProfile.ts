import { getProfile as _getProfile } from "@conquest/clickhouse/profile/getProfile";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getProfile = protectedProcedure
  .input(
    z.object({
      externalId: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { externalId } = input;
    const { workspaceId } = user;

    return await _getProfile({ externalId, workspaceId });
  });
