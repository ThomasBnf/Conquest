import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { prisma } from "lib/prisma";

type Props = {
  external_id: string | null;
  activity_type_key: string;
  title?: string | null;
  message: string;
  thread_id?: string | null;
  react_to?: string | null;
  reply_to?: string | null;
  invite_to?: string | null;
  event_id?: string | null;
  channel_id?: string | null;
  member_id: string;
  workspace_id: string;
  created_at?: Date;
  updated_at?: Date;
};

export const createActivity = async ({
  external_id,
  activity_type_key,
  title,
  message,
  thread_id,
  react_to,
  reply_to,
  invite_to,
  channel_id,
  event_id,
  member_id,
  workspace_id,
  created_at,
  updated_at,
}: Props) => {
  const activity_type = await prisma.activities_types.findUnique({
    where: {
      key_workspace_id: {
        key: activity_type_key,
        workspace_id,
      },
    },
  });

  if (!activity_type) return;

  const activity = await prisma.activities.create({
    data: {
      external_id,
      activity_type_id: activity_type.id,
      title,
      message,
      thread_id,
      react_to,
      reply_to,
      invite_to,
      channel_id,
      event_id,
      member_id,
      workspace_id,
      created_at,
      updated_at,
    },
  });

  await prisma.members.update({
    where: {
      id: member_id,
      workspace_id,
    },
    data: {
      last_activity: activity.created_at,
    },
  });

  return ActivitySchema.parse(activity);
};
