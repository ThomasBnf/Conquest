import { listChannels as _listChannels } from "@conquest/clickhouse/channel/listChannels";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure
  .input(
    z.object({
      source: SOURCE.optional(),
    }),
  )
  .query(async ({ ctx: { user }, input: { source } }) => {
    const { workspaceId } = user;

    return await _listChannels({ source, workspaceId });
  });
