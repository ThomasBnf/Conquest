import {
  type Activity,
  ActivitySchema,
} from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  activity_type_key: string;
  workspace_id: string;
} & Partial<Activity>;

export const updateActivity = async (props: Props) => {
  const {
    external_id,
    activity_type_key,
    message,
    member_id,
    workspace_id,
    ...data
  } = props;

  const activity_type = await prisma.activity_type.findUnique({
    where: {
      key_workspace_id: {
        key: activity_type_key,
        workspace_id,
      },
    },
  });

  if (!activity_type) return;

  const updatedActivity = await prisma.activity.update({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
    data: {
      message,
      activity_type_id: activity_type.id,
      ...data,
    },
  });

  return ActivitySchema.parse(updatedActivity);
};
