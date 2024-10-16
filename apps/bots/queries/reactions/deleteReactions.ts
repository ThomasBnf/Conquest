import { prisma } from "@/lib/prisma";

type Props = {
  channel_id: string;
  ts: string;
};

export const deleteReactions = async ({ channel_id, ts }: Props) => {
  return await prisma.activity.deleteMany({
    where: {
      channel_id,
      AND: [
        {
          details: {
            path: ["ts"],
            equals: ts,
          },
        },
        {
          details: {
            path: ["source"],
            equals: "SLACK",
          },
        },
        {
          details: {
            path: ["type"],
            equals: "REACTION",
          },
        },
      ],
    },
  });
};
