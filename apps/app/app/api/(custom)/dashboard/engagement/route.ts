import { getCurrentUser } from "@/features/users/functions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
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

    // Get all activities in date range
    const activities = await prisma.activity.findMany({
      where: {
        workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
      select: {
        created_at: true,
        member_id: true, // Add member_id to track unique members
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // Get all members count for each day
    const membersPerDay = await prisma.member.groupBy({
      by: ["created_at"],
      where: {
        workspace_id,
        created_at: {
          lte: to,
        },
      },
      _count: true,
    });

    // Generate array of dates between from and to
    const dates = eachDayOfInterval({ start: from, end: to });

    // Calculate running total of members for each day
    let runningMemberCount = 0;
    const memberCountByDate = new Map();

    for (const { created_at, _count } of membersPerDay) {
      runningMemberCount += _count;
      memberCountByDate.set(format(created_at, "PP"), runningMemberCount);
    }

    // Calculate activities per day with unique members
    const activitiesByDate = new Map();
    const uniqueMembersByDate = new Map();

    for (const { created_at, member_id } of activities) {
      const dateKey = format(created_at, "PP");

      // Track unique members per day
      if (!uniqueMembersByDate.has(dateKey)) {
        uniqueMembersByDate.set(dateKey, new Set());
      }
      uniqueMembersByDate.get(dateKey).add(member_id);

      // Track total activities
      activitiesByDate.set(dateKey, (activitiesByDate.get(dateKey) || 0) + 1);
    }

    const chartData = dates.map((date) => {
      const dateStr = format(date, "PP");
      const dailyActivities = activitiesByDate.get(dateStr) || 0;
      const totalMembers = memberCountByDate.get(dateStr) || runningMemberCount;
      const uniqueActiveMembers = uniqueMembersByDate.get(dateStr)?.size || 0;

      // Calculate engagement rate based on unique active members instead of activities
      return {
        date: dateStr,
        activities: dailyActivities,
        engagementRate:
          totalMembers > 0
            ? ((uniqueActiveMembers / totalMembers) * 100).toFixed(1)
            : "0",
      };
    });

    return NextResponse.json(chartData);
  });
