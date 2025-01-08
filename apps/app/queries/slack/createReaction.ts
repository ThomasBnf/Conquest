import { createActivity } from "@/queries/activities/createActivity";
import { getMember } from "../members/getMember";

type Props = {
  user: string;
  message: string;
  channel_id: string;
  react_to?: string | null;
  ts: string;
  workspace_id: string;
};

export const createReaction = async ({
  user,
  message,
  channel_id,
  react_to,
  ts,
  workspace_id,
}: Props) => {
  const member = await getMember({
    slack_id: user,
    workspace_id,
  });

  if (!member) return;

  await createActivity({
    external_id: null,
    activity_type_key: "slack:reaction",
    message,
    react_to,
    channel_id,
    member_id: member.id,
    workspace_id,
    created_at: new Date(Number(ts) * 1000),
    updated_at: new Date(Number(ts) * 1000),
  });
};
