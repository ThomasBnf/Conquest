import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  name: string;
  slug?: string;
  source: Source;
  workspace_id: string;
};

export const createChannel = async ({
  external_id,
  name,
  slug,
  source,
  workspace_id,
}: Props) => {
  const channel = await prisma.channel.create({
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
