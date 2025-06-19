import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Activity,
  ActivitySchema,
} from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../prisma";

type Props = {
  activityTypeKey: string;
  message?: string;
  source: Source;
  workspaceId: string;
} & Partial<Activity>;

export const createActivity = async (props: Props) => {
  const { message, ...rest } = props;

  const activity = await prisma.activity.create({
    data: {
      ...rest,
      message: message ?? null,
    },
  });

  return ActivitySchema.parse(activity);
};
