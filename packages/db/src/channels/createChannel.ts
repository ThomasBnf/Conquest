import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../prisma";

type Props = {
  external_id: string;
  name: string;
  source: Source;
  workspace_id: string;
};

export const createChannel = async ({
  external_id,
  name,
  source,
  workspace_id,
}: Props) => {
  const channel = await prisma.channel.create({
    data: {
      external_id,
      name,
      source,
      workspace_id,
    },
  });

  return ChannelSchema.parse(channel);
};
