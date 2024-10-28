import { getCurrentUser } from "@/helpers/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { format } from "date-fns";
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
      },
      include: {
        activities: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const parsedMembers = z.array(MemberWithActivitiesSchema).parse(members);
    const filteredMembers = parsedMembers.filter(
      (member) => member.created_at >= from && member.created_at <= to,
    );

    const chartData = [];

    let count = 0;

    while (from <= to) {
      const date = format(from, "PP");
      const newMembers = filteredMembers.filter(
        (member) => format(member.created_at, "PP") === date,
      );
      const activeMembers = parsedMembers.filter((member) =>
        member.activities.some(
          (activity) => format(activity.created_at, "PP") === date,
        ),
      );

      count += newMembers.length;

      chartData.push({
        date,
        total: parsedMembers.length,
        count,
        newMembers: newMembers.length,
        activeMembers: activeMembers.length,
      });

      from.setDate(from.getDate() + 1);
    }

    return NextResponse.json(chartData);
  });
