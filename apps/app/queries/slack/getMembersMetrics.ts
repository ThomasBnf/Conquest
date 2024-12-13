import { prisma } from "@/lib/prisma";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { subDays } from "date-fns";
import { getMemberLogs } from "../members/getMemberLogs";
import { getMemberLove } from "../members/getMemberLove";

type Props = {
  members: Member[];
};

export const getMembersMetrics = async ({ members }: Props) => {
  const today = new Date();
  const last365Days = subDays(today, 365);

  for (const member of members) {
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

    const { love, presence, level } = await getMemberLove({
      memberId: member.id,
      activities,
    });

    const logs = await getMemberLogs({ activities });

    const loveLogs = logs.map(({ date, love }) => ({ date, love }));
    const presenceLogs = logs.map(({ date, presence }) => ({ date, presence }));
    const levelLogs = logs.map(({ date, level }) => ({ date, level }));

    await prisma.members.update({
      where: { id: member.id },
      data: {
        love,
        presence,
        level,
        first_activity: activities.at(0)?.created_at,
        last_activity: activities.at(-1)?.created_at,
        love_logs: loveLogs,
        presence_logs: presenceLogs,
        level_logs: levelLogs,
      },
    });
  }
};
