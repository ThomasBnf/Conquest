import { prisma } from "@/lib/prisma";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";

type Props = {
  external_id: string;
  title?: string;
  message?: string;
  activity_type_id: string;
  reply_to?: string | null;
  workspace_id: string;
};

export const updateActivity = async ({
  external_id,
  title,
  message,
  activity_type_id,
  reply_to,
  workspace_id,
}: Props) => {
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
      activity_type: {
        connect: {
          id: activity_type_id,
        },
      },
      reply_to,
    },
  });

  return ActivitySchema.parse(updatedActivity);
};
