import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

type Props =
  | {
      externalId: string;
      workspaceId: string;
    }
  | {
      id: string;
    };

export const getActivity = async (props: Props) => {
  let where: Prisma.ActivityWhereInput;

  if ("externalId" in props) {
    const { externalId, workspaceId } = props;
    where = { externalId, workspaceId };
  } else {
    const { id } = props;
    where = { id };
  }

  const activity = await prisma.activity.findFirst({
    where,
    include: {
      activityType: true,
    },
  });

  if (!activity) return null;

  return ActivityWithTypeSchema.parse(activity);
};
