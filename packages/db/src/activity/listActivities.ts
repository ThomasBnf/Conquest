import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { startOfDay, subDays } from "date-fns";
import { prisma } from "../prisma";

type Props = {
  cursor?: number | null | undefined;
  period?: number;
  memberId?: string;
  companyId?: string;
  limit?: number;
  workspaceId: string;
};

export const listActivities = async ({
  period,
  memberId,
  companyId,
  cursor,
  limit,
  workspaceId,
}: Props) => {
  const today = new Date();
  const from = period ? startOfDay(subDays(today, period)) : undefined;

  const activities = await prisma.activity.findMany({
    where: {
      workspaceId,
      ...(memberId && { memberId }),
      ...(companyId && {
        member: {
          companyId,
        },
      }),
      ...(from && {
        createdAt: {
          gte: from,
          lte: today,
        },
      }),
    },
    include: {
      activityType: true,
      ...(companyId && {
        member: true,
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(limit && { take: limit }),
    ...(cursor && { skip: cursor }),
  });

  return ActivityWithTypeSchema.array().parse(activities);
};
