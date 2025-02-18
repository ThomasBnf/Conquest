import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Activity,
  ActivitySchema,
} from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  activity_type_key: string;
  message: string;
  member_id: string;
  source: Source;
  workspace_id: string;
} & Partial<Activity>;

export const upsertActivity = async (props: Props) => {
  const {
    external_id,
    activity_type_key,
    message,
    member_id,
    source,
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

  const activity = await prisma.activity.upsert({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
    update: {
      activity_type_id: activity_type.id,
      ...data,
    },
    create: {
      external_id,
      activity_type_id: activity_type.id,
      message,
      member_id,
      source,
      workspace_id,
      ...data,
    },
    include: {
      member: true,
    },
  });

  return ActivitySchema.parse(activity);
};
