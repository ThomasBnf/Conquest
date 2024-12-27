import { prisma } from "@/lib/prisma";
import { listActivitiesIn365Days } from "@/queries/activities/listActivitiesIn365Days";
import { getMemberLevel } from "@/queries/members/getMemberLevel";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const calculateMembersLevel = schemaTask({
  id: "calculate-members-level",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }) => {
    const members = MemberSchema.array().parse(
      await prisma.members.findMany({
        where: {
          workspace_id,
        },
      }),
    );

    for (const member of members) {
      const activities = await listActivitiesIn365Days({ member });
      const { pulse, presence, level } = await getMemberLevel({ activities });

      await prisma.members.update({
        where: {
          id: member.id,
        },
        data: {
          pulse,
          presence,
          level,
        },
      });
    }
  },
});
