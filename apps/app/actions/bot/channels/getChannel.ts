import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ChannelSchema } from "@conquest/zod/channel.schema";
import { z } from "zod";

export const getChannel = safeAction
  .metadata({
    name: "getChannel",
  })
  .schema(
    z.object({
      external_id: z.string(),
      workspace_id: z.string(),
    }),
  )
  .action(async ({ parsedInput: { external_id, workspace_id } }) => {
    const channel = await prisma.channel.findUnique({
      where: {
        external_id,
        workspace_id,
      },
    });

    return ChannelSchema.parse(channel);
  });
