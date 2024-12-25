import type { SOURCE } from "@conquest/database/src";
import { ChannelSchema } from "@conquest/zod/channel.schema";
import { prisma } from "lib/prisma";

type Props = {
  name: string;
  slug?: string;
  source: SOURCE;
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
