import { prisma } from "@/lib/prisma";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import type { Source } from "@conquest/zod/schemas/enum/source.enum";

type Props = {
  source: Source;
  workspace_id: string;
};

export const listChannels = async ({ source, workspace_id }: Props) => {
  const channels = await prisma.channels.findMany({
    where: {
      source,
      workspace_id,
    },
  });

  return ChannelSchema.array().parse(channels);
};
