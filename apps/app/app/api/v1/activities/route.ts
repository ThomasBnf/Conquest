import { getAuthenticatedUser } from "@/features/auth/functions/getAuthenticatedUser";
import { ActivitySchema } from "@conquest/zod/activity.schema";
import { prisma } from "lib/prisma";
import { safeRoute } from "lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const POST = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .body(
    z.object({
      member_id: z.string().cuid(),
      channel_id: z.string().cuid().optional(),
      activity_type_id: z.string().cuid(),
      message: z.string(),
    }),
  )
  .handler(async (_, { body, data }) => {
    const { member_id, channel_id, activity_type_id, message } = body;

    const activity = await prisma.activities.create({
      data: {
        member_id,
        activity_type_id,
        message,
        channel_id: channel_id ?? null,
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(ActivitySchema.parse(activity));
  });
