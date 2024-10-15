"use server";

import { ChannelSchema } from "@conquest/zod/channel.schema";
import { SOURCE } from "@conquest/zod/source.enum";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createChannel = authAction
  .metadata({
    name: "createChannel",
  })
  .schema(
    z.object({
      external_id: z.string().nullable(),
      name: z.string(),
      source: SOURCE,
    }),
  )
  .action(async ({ ctx, parsedInput: { external_id, name, source } }) => {
    const workspace_id = ctx.user.workspace_id;

    const channel = await prisma.channel.create({
      data: {
        external_id,
        name,
        source,
        workspace_id,
      },
    });

    return ChannelSchema.parse(channel);
  });
