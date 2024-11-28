import { authAction } from "@/lib/authAction";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const _getMember = authAction
  .metadata({
    name: "_getMember",
  })
  .schema(
    z.object({
      id: z.string().optional(),
      slack_id: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id, slack_id } }) => {
    const workspace_id = ctx.user.workspace_id;

    const member = await prisma.$queryRaw`
     SELECT 
            m.*,
            CAST(COALESCE(SUM(CASE 
                WHEN a.created_at > NOW() - INTERVAL '3 months' 
                THEN at.weight 
                ELSE 0 
            END), 0) AS INTEGER) as love,
            CAST(COALESCE(MAX(CASE 
                WHEN a.created_at > NOW() - INTERVAL '3 months' 
                THEN at.weight
                ELSE 0 
            END), 0) AS INTEGER) as level,
            COALESCE(
                json_agg(
                    CASE WHEN a.id IS NOT NULL THEN
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
                ) FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
            ) as activities
        FROM 
            members m
            LEFT JOIN activities a ON m.id = a.member_id
            LEFT JOIN activities_types at ON a.activity_type_id = at.id
        WHERE 
            m.id = ${id} OR m.slack_id = ${slack_id}
        GROUP BY 
            m.id
    `;

    const members = MemberWithActivitiesSchema.array().parse(member);

    return members[0];
  });
