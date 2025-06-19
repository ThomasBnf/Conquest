import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const listActivityTypes = async ({ workspaceId }: Props) => {
  const activityTypes = await prisma.activityType.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      points: "desc",
    },
  });

  return ActivityTypeSchema.array().parse(activityTypes);
};
