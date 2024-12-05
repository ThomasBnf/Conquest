import { prisma } from "@/lib/prisma";

type Props = {
  channel_id: string;
  react_to: string;
};

export const deleteListReactions = async ({ channel_id, react_to }: Props) => {
  return await prisma.activities.deleteMany({
    where: {
      channel_id,
      react_to,
      activity_type: {
        source: "SLACK",
        key: "slack:reaction",
      },
    },
  });
};
