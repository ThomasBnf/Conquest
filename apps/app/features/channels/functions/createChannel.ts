import { safeAction } from "@/lib/safeAction";
import { ChannelSchema } from "@conquest/zod/channel.schema";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createChannel = safeAction
  .metadata({
    name: "createChannel",
  })
  .schema(
    z.object({
      name: z.string(),
      source: SOURCE,
      external_id: z.string(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(
    async ({ parsedInput: { name, source, external_id, workspace_id } }) => {
      const channel = await prisma.channels.create({
        data: {
          name,
          source,
          external_id,
          workspace_id,
        },
      });

      return ChannelSchema.parse(channel);
    },
  );
