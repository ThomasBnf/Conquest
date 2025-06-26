import {
  type Activity,
  ActivitySchema,
} from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../prisma";

type Props = Activity;

export const updateActivity = async ({
  id,
  externalId,
  workspaceId,
  updatedAt,
  createdAt,
  ...data
}: Props) => {
  const activity = await prisma.activity.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });

  return ActivitySchema.parse(activity);
};
