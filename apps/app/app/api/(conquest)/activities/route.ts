import { getCurrentUser } from "@/helpers/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = safeRoute
  .use(async () => {
    return await getCurrentUser();
  })
  .query(
    z.object({
      member_id: z.string().optional(),
      page: z.coerce.number(),
    }),
  )
  .handler(async (_, { data: user, params, query }) => {
    const { member_id, page } = query;
    const workspace_id = user.workspace_id;

    const activities = await prisma.activity.findMany({
      where: {
        member_id,
        workspace_id,
      },
      include: {
        member: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: page ? 50 : undefined,
      skip: page ? (page - 1) * 50 : undefined,
    });

    return NextResponse.json(activities);
  });
