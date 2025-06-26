import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../prisma";

type Props = {
  cursor?: number | null | undefined;
  memberId?: string;
  companyId?: string;
  workspaceId: string;
};

export const listInfiniteActivities = async ({
  memberId,
  companyId,
  cursor,
  workspaceId,
}: Props) => {
  const activities = await prisma.activity.findMany({
    where: {
      workspaceId,
      ...(memberId && { memberId }),
      ...(companyId && {
        member: {
          companyId,
        },
      }),
    },
    include: {
      activityType: true,
      ...(companyId && {
        member: true,
      }),
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: 25,
    ...(cursor && { skip: cursor }),
  });

  return ActivityWithTypeSchema.array().parse(activities);
};
