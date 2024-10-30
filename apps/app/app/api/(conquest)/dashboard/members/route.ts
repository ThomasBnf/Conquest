import { getCurrentUser } from "@/helpers/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { eachDayOfInterval, format } from "date-fns";
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

    const totalMembers = await prisma.member.count({
      where: {
        workspace_id,
      },
    });

    const totalActiveMembers = await prisma.member.count({
      where: {
        workspace_id,
        activities: {
          some: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
    });

    const members = await prisma.member.findMany({
      where: {
        workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
      include: {
        activities: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const parsedMembers = z.array(MemberWithActivitiesSchema).parse(members);
    const dates = eachDayOfInterval({ start: from, end: to });

    let count = 0;

    const data = dates.map((currentDate) => {
      const date = format(currentDate, "PP");

      const newMembers = parsedMembers.filter(
        (member) => format(member.created_at, "PP") === date,
      );
      const activeMembers = parsedMembers.filter((member) =>
        member.activities.some(
          (activity) => format(activity.created_at, "PP") === date,
        ),
      );

      count += newMembers.length;

      return {
        date,
        members: count,
        newMembers: newMembers.length,
        activeMembers: activeMembers.length,
      };
    });

    const chartData = {
      totalMembers,
      totalActiveMembers,
      data,
    };

    return NextResponse.json(chartData);
  });
