import { prisma } from "../prisma";

type Props = {
  channelId: string;
  reactTo: string;
};

export const deleteManyActivities = async ({ channelId, reactTo }: Props) => {
  return await prisma.activity.deleteMany({
    where: {
      channelId,
      reactTo,
    },
  });
};
