import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { prisma } from "../../prisma";

type Props = {
  key: string;
  workspace_id: string;
};

export const getActivityType = async ({ key, workspace_id }: Props) => {
  const activityType = await prisma.activity_type.findFirst({
    where: {
      workspace_id,
      key,
    },
  });

  return ActivityTypeSchema.parse(activityType);
};
