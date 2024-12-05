import { prisma } from "@/lib/prisma";
import { ActivityWithTypeAndMemberSchema } from "@conquest/zod/schemas/activity.schema";

type Props = {
  member_id: string;
  workspace_id: string;
  page: number;
};

export const listMemberActivities = async ({
  member_id,
  workspace_id,
  page,
}: Props) => {
  const activities = await prisma.activities.findMany({
    where: {
      member_id,
      workspace_id,
    },
    include: {
      member: true,
      activity_type: true,
    },
    orderBy: {
      created_at: "desc",
    },
    skip: (page - 1) * 10,
    take: 10,
  });

  return ActivityWithTypeAndMemberSchema.array().parse(activities);
};
