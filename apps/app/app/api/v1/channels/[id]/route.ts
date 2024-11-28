import { getAuthenticatedUser } from "@/features/auth/functions/getAuthenticatedUser";
import { prisma } from "lib/prisma";
import { safeRoute } from "lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const PATCH = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .params(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .body(
    z.object({
      name: z.string(),
    }),
  )
  .handler(async (_, { params, body, data }) => {
    const { id } = params;
    const { name } = body;

    await prisma.channels.update({
      where: {
        id,
        workspace_id: data.workspace_id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({ message: "success" });
  });

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

    await prisma.channels.delete({
      where: {
        id,
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json({ message: "success" });
  });
