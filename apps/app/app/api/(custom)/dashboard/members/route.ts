import { getCurrentUser } from "@/features/users/functions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import type { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { NextResponse } from "next/server";
import { z } from "zod";

type QueryResult = {
  total_members: number;
  total_active_members: number;
  members: z.infer<typeof MemberWithActivitiesSchema>[];
};

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

    const [result] = await prisma.$queryRaw<[QueryResult]>`
    WITH MemberData AS (
      SELECT 
        m.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', a.id,
              'created_at', TO_CHAR(a.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) as activities
      FROM Members m
      LEFT JOIN Activities a ON m.id = a.member_id
      WHERE m.workspace_id = ${workspace_id}
      GROUP BY m.id
    )
    SELECT 
      CAST((
        SELECT COUNT(*) 
        FROM Members 
        WHERE workspace_id = ${workspace_id}
      ) AS INTEGER) as total_members,
      CAST((
        SELECT COUNT(DISTINCT m.id) 
        FROM Members m 
        WHERE m.workspace_id = ${workspace_id}
        AND m.joined_at BETWEEN ${from} AND ${to}
      ) AS INTEGER) as new_members,
      CAST((
        SELECT COUNT(DISTINCT m.id) 
        FROM Members m
        JOIN Activities a ON m.id = a.member_id
        WHERE m.workspace_id = ${workspace_id}
        AND a.created_at BETWEEN ${from} AND ${to}
      ) AS INTEGER) as active_members,
      COALESCE(JSON_AGG(md.*), '[]'::json) as members
    FROM MemberData md
  `;

    // const parsedMembers = z
    //   .array(MemberWithActivitiesSchema)
    //   .parse(result.members);
    // const dates = eachDayOfInterval({ start: from, end: to });

    // console.log(parsedMembers);

    // let count = 0;

    // const data = dates.map((currentDate) => {
    //   const date = format(currentDate, "PP");

    //   const newMembers = parsedMembers.filter((member) => {
    //     if (!member.joined_at) return false;
    //     return format(member.joined_at, "PP") === date;
    //   });
    //   const activeMembers = parsedMembers.filter((member) => {
    //     if (!member.activities?.length) return false;
    //     return member.activities.some(
    //       (activity) => format(activity.created_at, "PP") === date,
    //     );
    //   });

    //   count += newMembers.length;

    //   return {
    //     date,
    //     members: count,
    //     newMembers: newMembers.length,
    //     activeMembers: activeMembers.length,
    //   };
    // });

    // const chartData = {
    //   totalMembers: result.total_members,
    //   totalActiveMembers: result.total_active_members,
    //   data,
    // };

    console.log(result);

    return NextResponse.json(result);
  });
