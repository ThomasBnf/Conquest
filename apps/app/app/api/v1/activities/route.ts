import { ActivitySchema } from "@conquest/zod/activity.schema";
import { getAuthenticatedUser } from "features/auth/helpers/getAuthenticatedUser";
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
      contact_id: z.string().cuid(),
      channel_id: z.string().cuid().optional(),
      type: z.string(),
      message: z.string(),
    }),
  )
  .handler(async (_, { body, data }) => {
    const { contact_id, channel_id, type, message } = body;

    const activity = await prisma.activity.create({
      data: {
        contact_id,
        details: {
          source: "API",
          type,
          message,
        },
        channel_id: channel_id ?? null,
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(ActivitySchema.parse(activity));
  });
