import { ActivitySchema } from "@conquest/zod/activity.schema";
import { prisma } from "lib/prisma";

type Props = {
  external_id: string | null;
  activity_type_id: string;
  title?: string | null;
  message: string;
  thread_id?: string | null;
  react_to?: string | null;
  reply_to?: string | null;
  invite_by?: string | null;
  channel_id?: string | null;
  member_id: string;
  workspace_id: string;
  created_at?: Date;
  updated_at?: Date;
};

export const createActivity = async ({
  external_id,
  activity_type_id,
  title,
  message,
  thread_id,
  react_to,
  reply_to,
  invite_by,
  channel_id,
  member_id,
  workspace_id,
  created_at,
  updated_at,
}: Props) => {
  const activity = await prisma.activities.create({
    data: {
      external_id,
      activity_type_id,
      title,
      message,
      thread_id,
      react_to,
      reply_to,
      invite_by,
      channel_id,
      member_id,
      workspace_id,
      created_at,
      updated_at,
    },
  });

  return ActivitySchema.parse(activity);
};
