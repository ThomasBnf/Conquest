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

    const members = await prisma.member.findMany({
      where: {
        workspace_id: user.workspace_id,
        activities: {
          some: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
      include: {
        activities: {
          where: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
      take: 10,
    });

    const chartData = members
      .map((member) => ({
        member: member.full_name,
        activities: member.activities.length,
      }))
      .sort((a, b) => b.activities - a.activities);

    return NextResponse.json(chartData);
  });
