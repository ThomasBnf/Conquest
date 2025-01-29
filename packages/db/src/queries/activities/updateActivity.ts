import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  title?: string;
  message?: string;
  activity_type_key: string;
  reply_to?: string | null;
  workspace_id: string;
};

export const updateActivity = async ({
  external_id,
  title,
  message,
  activity_type_key,
  reply_to,
  workspace_id,
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

  const updatedActivity = await prisma.activities.update({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
    data: {
      title,
      message,
      activity_type_id: activity_type.id,
      reply_to,
    },
  });

  return ActivitySchema.parse(updatedActivity);
};
