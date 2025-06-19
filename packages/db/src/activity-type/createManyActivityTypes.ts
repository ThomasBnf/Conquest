import type { ActivityTypeRule } from "@conquest/zod/schemas/activity-type.schema";
import { SOURCE, prisma } from "../prisma";

type Props = {
  activityTypes: {
    key: string;
    name: string;
    source: SOURCE;
    points: number;
    conditions: ActivityTypeRule[];
    deletable: boolean;
  }[];
  workspaceId: string;
};

export const createManyActivityTypes = async (props: Props) => {
  const { activityTypes, workspaceId } = props;

  return await prisma.activityType.createMany({
    data: activityTypes.map((activityType) => ({
      ...activityType,
      workspaceId,
    })),
  });
};
