import type { Source } from "@conquest/zod/enum/source.enum";
import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../prisma";

type Props = {
  externalId: string;
  activityTypeKey: string;
  message: string;
  memberId: string;
  source: Source;
  workspaceId: string;
} & Partial<Activity>;

export const upsertActivity = async (props: Props) => {
  const {
    externalId,
    activityTypeKey,
    message,
    memberId,
    source,
    workspaceId,
    ...data
  } = props;

  await prisma.activity.upsert({
    where: {
      externalId_workspaceId: {
        externalId,
        workspaceId,
      },
    },
    update: {
      message,
      memberId,
      source,
      activityTypeKey,
      ...data,
    },
    create: {
      externalId,
      message,
      memberId,
      source,
      workspaceId,
      activityTypeKey,
      ...data,
    },
  });
};
