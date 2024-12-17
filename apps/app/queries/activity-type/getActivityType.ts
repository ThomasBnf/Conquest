import { prisma } from "@/lib/prisma";
import {
  ActivityTypeSchema,
  type KEY,
} from "@conquest/zod/activity-type.schema";

type Props = {
  key: KEY;
  workspace_id: string;
};

export const getActivityType = async ({ key, workspace_id }: Props) => {
  const activityType = await prisma.activities_types.findFirst({
    where: {
      workspace_id,
      key,
    },
  });

  return ActivityTypeSchema.parse(activityType);
};
