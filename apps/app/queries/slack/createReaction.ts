import { createActivity } from "@/queries/activities/createActivity";
import { prisma } from "lib/prisma";

type Props = {
  user: string;
  message: string;
  channel_id: string;
  react_to?: string | null;
  ts: string;
  activity_type_id: string;
  workspace_id: string;
};

export const createReaction = async ({
  user,
  message,
  channel_id,
  react_to,
  ts,
  activity_type_id,
  workspace_id,
}: Props) => {
  const member = await prisma.members.findUnique({
    where: {
      slack_id_workspace_id: {
        slack_id: user,
        workspace_id,
      },
    },
  });

  if (!member) return;

  await createActivity({
    external_id: null,
    activity_type_id,
    message,
    react_to,
    channel_id,
    member_id: member.id,
    workspace_id,
    created_at: new Date(Number(ts) * 1000),
    updated_at: new Date(Number(ts) * 1000),
  });
};
