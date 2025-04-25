import { createChannel } from "@conquest/clickhouse/channels/createChannel";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createManyChannels = protectedProcedure
  .input(
    z.object({
      channels: z.array(
        z.object({
          externalId: z.string(),
          name: z.string(),
          slug: z.string().optional(),
          source: SOURCE,
        }),
      ),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { channels } = input;

    for (const channel of channels) {
      await createChannel({
        ...channel,
        externalId: channel.externalId,
        workspaceId,
      });
    }
  });
