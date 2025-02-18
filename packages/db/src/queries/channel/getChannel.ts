import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  workspace_id: string;
};

export const getChannel = async ({ external_id, workspace_id }: Props) => {
  const channel = await prisma.channel.findUnique({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
  });

  if (!channel) return null;

  return ChannelSchema.parse(channel);
};
