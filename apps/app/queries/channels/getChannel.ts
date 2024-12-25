import { prisma } from "@/lib/prisma";
import { ChannelSchema } from "@conquest/zod/channel.schema";

type Props = {
  external_id: string;
  workspace_id: string;
};

export const getChannel = async ({ external_id, workspace_id }: Props) => {
  const channel = await prisma.channels.findUnique({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
  });

  return ChannelSchema.parse(channel);
};
