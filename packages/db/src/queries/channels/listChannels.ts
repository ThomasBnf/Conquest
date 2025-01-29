import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../../prisma";

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
