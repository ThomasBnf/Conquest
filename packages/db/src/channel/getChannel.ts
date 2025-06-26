import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

type Props =
  | {
      id: string;
    }
  | {
      externalId: string;
      workspaceId: string;
    };

export const getChannel = async (props: Props) => {
  let where: Prisma.ChannelWhereInput;

  if ("id" in props) {
    where = { id: props.id };
  } else {
    const { externalId, workspaceId } = props;
    where = { externalId, workspaceId };
  }

  const channel = await prisma.channel.findFirst({
    where,
  });

  if (!channel) return null;
  return ChannelSchema.parse(channel);
};
