import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Activity,
  ActivitySchema,
} from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id?: string | null;
  activity_type_key: string;
  message: string;
  member_id: string;
  source: Source;
  workspace_id: string;
} & Partial<Activity>;

export const createActivity = async (props: Props) => {
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

  if (!activity_type) return null;

  const activity = await prisma.activity.create({
    data: {
      external_id,
      activity_type_id: activity_type.id,
      message,
      member_id,
      ...data,
      workspace_id,
    },
  });

  return ActivitySchema.parse(activity);
};
