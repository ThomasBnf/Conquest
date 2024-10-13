import { getAuthenticatedUser } from "features/auth/helpers/getAuthenticatedUser";
import { prisma } from "lib/prisma";
import { safeRoute } from "lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const DELETE = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .params(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .handler(async (_, { params, data }) => {
    const { id } = params;

    await prisma.activity.delete({
      where: {
        id,
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json({ message: "success" });
  });
