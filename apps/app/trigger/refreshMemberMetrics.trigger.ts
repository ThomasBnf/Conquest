import { calculateMemberMetrics } from "@/queries/dashboard/calculateMemberMetrics";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const refreshMemberMetrics = schemaTask({
  id: "refresh-member-metrics",
  schema: z.object({
    member: MemberSchema,
  }),
  run: async ({ member }) => {
    await calculateMemberMetrics({ member });
  },
});
