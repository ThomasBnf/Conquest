import { getProfileBySource as _getProfileBySource } from "@conquest/clickhouse/profile/getProfileBySource";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getProfileBySource = protectedProcedure
  .input(
    z.object({
      memberId: z.string(),
      source: SOURCE,
    }),
  )
  .query(async ({ input }) => {
    const { memberId, source } = input;

    return await _getProfileBySource({ memberId, source });
  });
