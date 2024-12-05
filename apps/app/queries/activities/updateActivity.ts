import { prisma } from "@/lib/prisma";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";

type Props = {
  external_id: string;
  message: string;
  activity_type_id: string;
  reply_to: string | null;
};

export const updateActivity = async ({
  external_id,
  message,
  activity_type_id,
  reply_to,
}: Props) => {
  const activity = await prisma.activities.update({
    where: {
      external_id,
    },
    data: {
      message,
      activity_type: {
        connect: {
          id: activity_type_id,
        },
      },
      reply_to,
    },
  });

  return ActivitySchema.parse(activity);
};
