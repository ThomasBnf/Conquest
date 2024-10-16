import { prisma } from "@/lib/prisma";

type Props = {
  ts: string;
  details: {
    source: "SLACK";
    type: "MESSAGE" | "REACTION" | "REPLY";
    message: string;
    attachments: { title: string; url: string }[];
    files: { title: string; url: string }[];
    ts: string | undefined;
  };
};

export const updateActivity = async ({ ts, details }: Props) => {
  return await prisma.activity.updateMany({
    where: {
      details: {
        path: ["ts"],
        equals: ts,
      },
    },
    data: {
      details,
    },
  });
};
