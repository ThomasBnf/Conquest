import { getProfileBySource as _getProfileBySource } from "@conquest/clickhouse/profiles/getProfileBySource";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getProfileBySource = protectedProcedure
  .input(
    z.object({
      member_id: z.string(),
      source: SOURCE,
    }),
  )
  .query(async ({ input }) => {
    const { member_id, source } = input;

    return await _getProfileBySource({ member_id, source });
  });
