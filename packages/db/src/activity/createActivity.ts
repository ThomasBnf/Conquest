import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Activity,
  ActivitySchema,
} from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../prisma";

type Props = {
  activityTypeKey: string;
  message?: string | null;
  memberId: string;
  source: Source;
  workspaceId: string;
} & Partial<Activity>;

export const createActivity = async (props: Props) => {
  const { message, title, ...rest } = props;

  const activity = await prisma.activity.create({
    data: {
      ...rest,
      title: title ?? null,
      message: message ?? null,
    },
  });

  return ActivitySchema.parse(activity);
};
