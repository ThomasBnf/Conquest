import { getMember } from "@/features/members/functions/getMember";
import { getCurrentUser } from "@/features/users/functions/getCurrentUser";
import { safeRoute } from "@/lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = safeRoute
  .use(async () => {
    return await getCurrentUser();
  })
  .params(
    z.object({
      slackId: z.string(),
    }),
  )
  .handler(async (_, { params, data: user }) => {
    const { slackId } = params;
    const workspace_id = user.workspace_id;

    const rMember = await getMember({
      slack_id: slackId,
      workspace_id,
    });

    return NextResponse.json(rMember?.data);
  });
