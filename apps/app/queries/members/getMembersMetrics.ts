import { prisma } from "@/lib/prisma";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { listActivitiesIn365Days } from "../activities/listActivitiesIn365Days";
import { getMemberLevel } from "./getMemberLevel";
import { getMemberLogs } from "./getMemberLogs";

type Props = {
  member: Member;
};

export const getMembersMetrics = async ({ member }: Props) => {
  const firstActivity = await prisma.activities.findFirst({
    where: {
      member_id: member.id,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const activities = await listActivitiesIn365Days({ member });
  const { pulse, presence, level } = await getMemberLevel({ activities });

  const logs = await getMemberLogs({ activities });

  await prisma.members.update({
    where: { id: member.id },
    data: {
      pulse,
      presence,
      level,
      first_activity: firstActivity?.created_at,
      last_activity: activities.at(-1)?.created_at,
      logs,
    },
  });
};
