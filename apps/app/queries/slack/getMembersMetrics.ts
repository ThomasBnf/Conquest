import { prisma } from "@/lib/prisma";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { subDays } from "date-fns";
import { getMemberLogs } from "../members/getMemberLogs";
import { getMemberPulse } from "../members/getMemberPulse";

type Props = {
  member: Member;
};

export const getMembersMetrics = async ({ member }: Props) => {
  const today = new Date();
  const last365Days = subDays(today, 365);

  const activities = await prisma.activities.findMany({
    where: {
      member_id: member.id,
      created_at: {
        gte: last365Days,
      },
      activity_type: {
        weight: {
          gt: 0,
        },
      },
    },
    include: {
      activity_type: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const { pulse, presence, level } = await getMemberPulse({
    memberId: member.id,
    activities,
  });

  const logs = await getMemberLogs({ activities });

  await prisma.members.update({
    where: { id: member.id },
    data: {
      pulse,
      presence,
      level,
      first_activity: activities.at(0)?.created_at,
      last_activity: activities.at(-1)?.created_at,
      logs,
    },
  });
};
