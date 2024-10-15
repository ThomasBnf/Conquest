import { safeAction } from "@/lib/safeAction";
import { ChannelSchema } from "@conquest/zod/channel.schema";
import { SOURCE } from "@conquest/zod/source.enum";
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
      external_id: z.string().nullable(),
      workspace_id: z.string(),
    }),
  )
  .action(
    async ({ parsedInput: { name, source, external_id, workspace_id } }) => {
      const channel = await prisma.channel.create({
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
