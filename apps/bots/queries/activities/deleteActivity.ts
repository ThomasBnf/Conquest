import { prisma } from "@/lib/prisma";

type Props = {
  channel_id: string;
  message?: string;
  ts: string;
};

export const deleteActivity = async ({ channel_id, message, ts }: Props) => {
  const AND = message
    ? [
        {
          details: {
            path: ["ts"],
            equals: ts,
          },
        },
        {
          details: {
            path: ["message"],
            equals: message,
          },
        },
      ]
    : [
        {
          details: {
            path: ["ts"],
            equals: ts,
          },
        },
      ];

  return await prisma.activity.deleteMany({
    where: {
      channel_id,
      AND,
    },
  });
};
