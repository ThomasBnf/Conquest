import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../prisma";

type Props = {
  source?: Source;
  workspaceId: string;
};

export const listChannels = async ({ source, workspaceId }: Props) => {
  const channels = await prisma.channel.findMany({
    where: {
      workspaceId,
      ...(source && { source }),
    },
    orderBy: {
      name: "asc",
    },
  });

  return ChannelSchema.array().parse(channels);
};
