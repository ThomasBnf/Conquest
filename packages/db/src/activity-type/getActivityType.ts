import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { prisma } from "../prisma";

type Props = {
  key: string;
  workspaceId: string;
};

export const getActivityType = async ({ key, workspaceId }: Props) => {
  const activityType = await prisma.activityType.findUnique({
    where: {
      key,
      workspaceId,
    },
  });

  if (!activityType) return null;
  return ActivityTypeSchema.parse(activityType);
};
