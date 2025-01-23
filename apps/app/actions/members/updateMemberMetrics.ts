"use server";

import { env } from "@/env.mjs";
import { authAction } from "@/lib/authAction";
import { getMember } from "@/queries/members/getMember";
import { updateMemberMetrics as updateMemberMetricsTrigger } from "@/trigger/updateMemberMetrics.trigger";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { configure } from "@trigger.dev/sdk/v3";
import { z } from "zod";

configure({ secretKey: env.TRIGGER_SECRET_KEY });

export const updateMemberMetrics = authAction
  .metadata({
    name: "updateMemberMetrics",
  })
  .schema(
    z.object({
      member_id: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { member_id } }) => {
    const { workspace_id } = user;

    const member = MemberSchema.parse(
      await getMember({ id: member_id, workspace_id }),
    );

    await updateMemberMetricsTrigger.trigger({ member });
  });
