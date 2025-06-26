import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

type Props =
  | {
      id: string;
    }
  | {
      externalId: string;
      channelId?: string;
      workspaceId: string;
    };

export const deleteActivity = async (props: Props) => {
  let where: Prisma.ActivityWhereInput;

  if ("id" in props) {
    where = { id: props.id };
  } else {
    const { externalId, channelId, workspaceId } = props;

    where = {
      externalId,
      workspaceId,
      ...(channelId && { channelId }),
    };
  }

  return await prisma.activity.deleteMany({
    where,
  });
};
