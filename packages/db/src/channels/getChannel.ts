import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../prisma";

type Props =
  | {
      external_id: string;
      workspace_id: string;
    }
  | {
      id: string;
    };

export const getChannel = async (props: Props) => {
  if ("external_id" in props) {
    const { external_id, workspace_id } = props;

    const channel = await prisma.channel.findUnique({
      where: {
        external_id_workspace_id: {
          external_id,
          workspace_id,
        },
      },
    });

    if (!channel) return undefined;
    return ChannelSchema.parse(channel);
  }

  const { id } = props;

  const channel = await prisma.channel.findUnique({
    where: { id },
  });

  if (!channel) return undefined;
  return ChannelSchema.parse(channel);
};
