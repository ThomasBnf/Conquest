import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "lib/prisma";

type Props = {
  name: string;
  slug?: string;
  source: Source;
  external_id: string;
  workspace_id: string;
};

export const createChannel = async ({
  name,
  slug,
  source,
  external_id,
  workspace_id,
}: Props) => {
  const channel = await prisma.channels.create({
    data: {
      name,
      slug,
      source,
      external_id,
      workspace_id,
    },
  });

  return ChannelSchema.parse(channel);
};
