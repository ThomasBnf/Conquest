import { prisma } from "@/lib/prisma";

type Props = {
  channel_id: string;
};

export const listActivities = async ({ channel_id }: Props) => {
  return await prisma.activity.findMany({
    where: {
      channel_id,
    },
  });
};
