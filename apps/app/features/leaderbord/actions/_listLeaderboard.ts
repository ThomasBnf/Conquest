"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const _listLeaderboard = authAction
  .metadata({ name: "_listLeaderboard" })
  .schema(
    z.object({
      page: z.number().default(0),
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { page, from, to } }) => {
    const workspace_id = user.workspace_id;

    const members = await prisma.$queryRaw`
      WITH member_activities AS (
        SELECT 
          m.*,
          CAST(COALESCE(SUM(CASE 
            WHEN a.created_at >= ${from} AND a.created_at <= ${to}
            THEN at.weight 
            ELSE 0 
          END), 0) AS INTEGER) as love,
          COALESCE(
            json_agg(
              CASE WHEN a.id IS NOT NULL AND a.created_at >= ${from} AND a.created_at <= ${to} THEN
                json_build_object(
                  'id', a.id,
                  'external_id', COALESCE(a.external_id, ''),
                  'message', COALESCE(a.message, ''),
                  'reply_to', COALESCE(a.reply_to, ''),
                  'react_to', COALESCE(a.react_to, ''),
                  'invite_by', COALESCE(a.invite_by, ''),
                  'channel_id', a.channel_id,
                  'member_id', a.member_id,
                  'workspace_id', a.workspace_id,
                  'activity_type_id', a.activity_type_id,
                  'created_at', TO_CHAR(a.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                  'updated_at', TO_CHAR(a.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                  'activity_type', row_to_json(at.*)
                )
              ELSE NULL END
            ) FILTER (WHERE a.id IS NOT NULL AND a.created_at >= ${from} AND a.created_at <= ${to}),
            '[]'::json
          ) as activities
        FROM 
          members m
          LEFT JOIN activities a ON m.id = a.member_id
          LEFT JOIN activities_types at ON a.activity_type_id = at.id
        WHERE 
          m.workspace_id = ${workspace_id}
        GROUP BY 
          m.id
      )
      SELECT *
      FROM member_activities
      ORDER BY love DESC NULLS LAST, id ASC
      LIMIT 50 
      OFFSET ${(page - 1) * 50};
    `;

    return MemberWithActivitiesSchema.array().parse(members);
  });
