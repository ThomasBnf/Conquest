import { prisma } from "@/lib/prisma";

type Props = {
  member_id: string;
  workspace_id: string;
};

export const listMemberActivitiesCount = async ({
  member_id,
  workspace_id,
}: Props) => {
  const activities = await prisma.activities.groupBy({
    by: ["created_at"],
    where: {
      member_id,
      workspace_id,
    },
    _count: true,
    orderBy: {
      created_at: "asc",
    },
  });

  return activities;
};
