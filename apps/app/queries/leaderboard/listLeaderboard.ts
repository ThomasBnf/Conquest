import { prisma } from "@/lib/prisma";
import { MemberWithActivitiesSchema } from "@conquest/zod/schemas/activity.schema";

type Props = {
  from: Date;
  to: Date;
  page: number;
  workspace_id: string;
};

export const listLeaderboard = async ({
  from,
  to,
  page = 1,
  workspace_id,
}: Props) => {
  const members = await prisma.members.findMany({
    where: {
      workspace_id,
      activities: {
        some: {
          created_at: {
            gte: from,
            lte: to,
          },
        },
      },
    },
    include: {
      company: true,
    },
    orderBy: {
      love: "desc",
    },
  });

  return MemberWithActivitiesSchema.array().parse(members);
};
