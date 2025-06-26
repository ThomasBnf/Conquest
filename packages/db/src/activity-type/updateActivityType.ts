import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { prisma } from "../prisma";

type Props = { key: string; workspaceId: string } & Partial<ActivityType>;

export const updateActivityType = async ({
  key,
  workspaceId,
  ...data
}: Props) => {
  return await prisma.activityType.update({
    where: {
      key_workspaceId: {
        key,
        workspaceId,
      },
    },
    data: {
      ...data,
    },
  });
};
