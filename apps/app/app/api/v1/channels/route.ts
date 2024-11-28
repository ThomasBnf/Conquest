import { getAuthenticatedUser } from "@/features/auth/functions/getAuthenticatedUser";
import { ChannelSchema } from "@conquest/zod/channel.schema";
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
      name: z.string(),
    }),
  )
  .handler(async (_, { body, data }) => {
    const { name } = body;

    const channel = await prisma.channels.create({
      data: {
        name,
        source: "API",
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(ChannelSchema.parse(channel));
  });

export const GET = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .handler(async (_, { data }) => {
    const channels = await prisma.channels.findMany({
      where: {
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(ChannelSchema.array().parse(channels));
  });
