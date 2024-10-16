import { prisma } from "lib/prisma";

type Props = {
  details: {
    source: "SLACK";
    type: "MESSAGE" | "REACTION" | "REPLY";
    message: string;
    attachments: { title: string; url: string }[];
    files: { title: string; url: string }[];
    ts: string | undefined;
  };
  channel_id: string;
  contact_id: string;
  workspace_id: string;
};

export const createActivity = async ({
  details,
  channel_id,
  contact_id,
  workspace_id,
}: Props) => {
  return await prisma.activity.create({
    data: {
      details,
      channel_id,
      contact_id,
      workspace_id,
    },
  });
};
