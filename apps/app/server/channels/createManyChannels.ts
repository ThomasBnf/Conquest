import { prisma } from "@conquest/db/prisma";

import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createManyChannels = protectedProcedure
  .input(
    z.object({
      channels: z.array(
        z.object({
          external_id: z.string(),
          name: z.string(),
          slug: z.string().optional(),
          source: SOURCE,
        }),
      ),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { channels } = input;

    return await prisma.channel.createMany({
      data: channels.map((channel) => ({
        ...channel,
        workspace_id,
      })),
    });
  });
