import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { prisma } from "../prisma";

type Props =
  | { id: string; externalId?: string; name?: string }
  | { externalId: string; name: string; workspaceId: string };

export const updateChannel = async (props: Props) => {
  if ("id" in props) {
    const { id, externalId, name } = props;

    return await prisma.channel.update({
      where: {
        id,
      },
      data: {
        ...(externalId && { externalId }),
        ...(name && { name }),
        updatedAt: new Date(),
      },
    });
  }

  const { externalId, name, workspaceId } = props;

  const channel = await prisma.channel.update({
    where: {
      externalId,
      workspaceId,
    },
    data: {
      ...(name && { name }),
      updatedAt: new Date(),
    },
  });

  return ChannelSchema.parse(channel);
};
