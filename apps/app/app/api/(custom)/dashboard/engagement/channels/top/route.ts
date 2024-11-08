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

    const chartData = await prisma.channel.findMany({
      where: {
        workspace_id,
      },
      include: {
        _count: {
          select: {
            activities: {
              where: {
                created_at: {
                  gte: from,
                  lte: to,
                },
              },
            },
          },
        },
      },
      orderBy: {
        activities: {
          _count: "desc",
        },
      },
      take: 10,
    });

    return NextResponse.json(chartData);
  });
