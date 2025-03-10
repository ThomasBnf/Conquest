import { getChannel as _getChannel } from "@conquest/clickhouse/channels/getChannel";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getChannel = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    return await _getChannel({ id, workspace_id });
  });
