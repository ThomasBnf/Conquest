import { prisma } from "@conquest/db/prisma";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getChannel = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    const channel = await prisma.channel.findUnique({
      where: {
        id,
        workspace_id,
      },
    });

    if (!channel) return null;
    return ChannelSchema.parse(channel);
  });
