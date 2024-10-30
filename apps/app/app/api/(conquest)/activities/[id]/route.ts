import { getCurrentUser } from "@/helpers/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = safeRoute
  .use(async () => {
    return await getCurrentUser();
  })
  .params(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async (_, { params, data: user }) => {
    const { id } = params;

    const activity = await prisma.activity.findUnique({
      where: {
        external_id: id,
        workspace_id: user.workspace_id,
      },
      include: {
        member: true,
      },
    });

    return NextResponse.json(activity);
  });
