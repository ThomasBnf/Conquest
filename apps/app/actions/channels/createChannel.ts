"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { ChannelSchema } from "schemas/channel.schema";
import { z } from "zod";

export const createChannel = authAction
  .metadata({
    name: "createChannel",
  })
  .schema(
    z.object({
      name: z.string(),
      external_id: z.string().nullable(),
    }),
  )
  .action(async ({ ctx, parsedInput: { name, external_id } }) => {
    const workspace_id = ctx.user.workspace_id;

    const channel = await prisma.channel.create({
      data: {
        name,
        external_id,
        workspace_id,
      },
    });

    return ChannelSchema.parse(channel);
  });
