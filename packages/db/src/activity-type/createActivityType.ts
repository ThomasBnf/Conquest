import {
  type ActivityType,
  ActivityTypeRule,
  ActivityTypeSchema,
} from "@conquest/zod/schemas/activity-type.schema";
import { SOURCE, prisma } from "../prisma";

type Props = Partial<ActivityType> & {
  key: string;
  name: string;
  source: SOURCE;
  points: number;
  conditions: ActivityTypeRule[];
  workspaceId: string;
};

export const createActivityType = async (props: Props) => {
  const { key, name, source, points, conditions, workspaceId, ...rest } = props;

  const activityType = await prisma.activityType.create({
    data: {
      ...rest,
      key,
      name,
      source,
      points,
      conditions,
      workspaceId,
    },
  });

  return ActivityTypeSchema.parse(activityType);
};
