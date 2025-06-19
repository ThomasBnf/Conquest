import { getChannel as _getChannel } from "@conquest/db/channel/getChannel";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getChannel = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { id } = input;

    return await _getChannel({ id, workspaceId });
  });
