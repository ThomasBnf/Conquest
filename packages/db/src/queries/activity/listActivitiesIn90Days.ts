import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { startOfDay, subDays } from "date-fns";
import { prisma } from "../../prisma";

type Props = {
  member: Member;
};

export const listActivitiesIn90Days = async ({ member }: Props) => {
  const today = new Date();
  const last90Days = startOfDay(subDays(today, 90));

  const { id, workspace_id } = member;

  const activities = await prisma.activity.findMany({
    where: {
      member_id: id,
      workspace_id,
      created_at: {
        gte: last90Days,
      },
    },
    include: {
      activity_type: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return ActivityWithTypeSchema.array().parse(activities);
};
