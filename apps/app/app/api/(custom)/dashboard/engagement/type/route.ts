import { getCurrentUser } from "@/features/users/functions/getCurrentUser";
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
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .handler(async (_, { query, data: user }) => {
    const { from, to } = query;
    const { workspace_id } = user;

    const activities = await prisma.activities.findMany({
      where: {
        workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
      include: {
        activity_type: true,
      },
    });

    const result = activities.reduce<Record<string, number>>(
      (acc, activity) => {
        const type = activity.activity_type?.key;
        if (!type) return acc;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {},
    );

    return NextResponse.json(result);
  });
