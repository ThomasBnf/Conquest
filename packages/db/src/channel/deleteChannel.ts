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

export const deleteChannel = async (props: Props) => {
  let where: Prisma.ChannelWhereUniqueInput;

  if ("id" in props) {
    where = { id: props.id };
  } else {
    const { externalId, workspaceId } = props;
    where = {
      externalId,
      workspaceId,
    };
  }

  await prisma.channel.delete({
    where,
  });
};
