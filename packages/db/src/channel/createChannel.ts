import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../prisma";

type Props = {
  externalId: string;
  name: string;
  source: Source;
  workspaceId: string;
};

export const createChannel = async ({
  externalId,
  name,
  source,
  workspaceId,
}: Props) => {
  const channel = await prisma.channel.create({
    data: {
      externalId,
      name,
      source,
      workspaceId,
    },
  });

  return ChannelSchema.parse(channel);
};
