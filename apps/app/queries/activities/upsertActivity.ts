import { prisma } from "@/lib/prisma";
import {
  type Activity,
  ActivitySchema,
} from "@conquest/zod/schemas/activity.schema";

type Props = {
  external_id: string;
  activity_type_key: string;
  message: string;
  member_id: string;
  data?: Partial<Activity>;
  workspace_id: string;
};

export const upsertActivity = async ({
  external_id,
  activity_type_key,
  message,
  member_id,
  data,
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

  const activity = await prisma.activities.upsert({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
    update: {},
    create: {
      ...data,
      external_id,
      activity_type_id: activity_type.id,
      message,
      member_id,
      workspace_id,
    },
    include: {
      member: true,
    },
  });

  return ActivitySchema.parse(activity);
};
