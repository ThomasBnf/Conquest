import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllChannels = protectedProcedure
  .input(
    z.object({
      source: SOURCE.optional(),
    }),
  )
  .query(async ({ ctx: { user }, input: { source } }) => {
    const { workspace_id } = user;

    const channels = await prisma.channel.findMany({
      where: {
        workspace_id,
        source,
      },
    });

    return ChannelSchema.array().parse(channels);
  });
