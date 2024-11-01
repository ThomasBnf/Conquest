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
      page: z.coerce.number(),
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .handler(async (_, { data: user, query }) => {
    const { page, from, to } = query;
    const workspace_id = user.workspace_id;

    const members = await prisma.member.findMany({
      where: {
        workspace_id,
        AND: [
          {
            activities: {
              every: {
                created_at: {
                  gte: from,
                  lte: to,
                },
              },
            },
          },
          {
            activities: {
              some: {},
            },
          },
        ],
      },
      include: {
        activities: true,
      },
      orderBy: {
        activities: {
          _count: "desc",
        },
      },
      take: 50,
      skip: (page - 1) * 50,
    });

    return NextResponse.json(members);
  });
