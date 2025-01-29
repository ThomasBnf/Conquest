import { ActivityWithTypeAndMemberSchema } from "@conquest/zod/schemas/activity.schema";
import { z } from "zod";
import { prisma } from "../../prisma";

type Props = {
  page: number;
  workspace_id: string;
};

export const listActivities = async ({ page, workspace_id }: Props) => {
  const activities = await prisma.activities.findMany({
    where: {
      workspace_id,
    },
    include: {
      activity_type: true,
      member: true,
    },
    orderBy: {
      created_at: "desc",
    },
    take: 20,
    skip: (page - 1) * 20,
  });

  return z.array(ActivityWithTypeAndMemberSchema).parse(activities);
};
