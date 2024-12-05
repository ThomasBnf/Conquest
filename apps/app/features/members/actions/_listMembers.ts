"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const _listMembers = authAction
  .metadata({ name: "_listMembers" })
  .schema(
    z.object({
      search: z.string(),
      page: z.number(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .action(
    async ({ ctx: { user }, parsedInput: { search, page, id, desc } }) => {
      const workspace_id = user.workspace_id;

      const members = await prisma.$queryRaw`
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
            m.workspace_id = ${workspace_id}
            AND m.search ILIKE '%' || ${search} || '%'
        GROUP BY 
            m.id
        ORDER BY 
            CASE WHEN ${desc} = true THEN
                CASE ${id}
                    WHEN 'love' THEN SUM(CASE WHEN a.created_at > NOW() - INTERVAL '3 months' THEN at.weight ELSE 0 END)
                    WHEN 'level' THEN MAX(CASE WHEN a.created_at > NOW() - INTERVAL '3 months' THEN at.weight ELSE 0 END)
                    ELSE NULL
                END
            END DESC NULLS LAST,
            CASE WHEN ${desc} = true THEN
                CASE ${id}
                    WHEN 'full_name' THEN m.full_name
                    WHEN 'job_title' THEN m.job_title
                    WHEN 'emails' THEN m.emails[1]
                    WHEN 'tags' THEN m.tags[0]
                    WHEN 'joined_at' THEN m.joined_at::text
                    WHEN 'locale' THEN m.locale
                    WHEN 'source' THEN CAST(m.source AS TEXT)
                    ELSE NULL
                END
            END DESC NULLS LAST,
            CASE WHEN ${desc} = false THEN
                CASE ${id}
                    WHEN 'love' THEN SUM(CASE WHEN a.created_at > NOW() - INTERVAL '3 months' THEN at.weight ELSE 0 END)
                    WHEN 'level' THEN MAX(CASE WHEN a.created_at > NOW() - INTERVAL '3 months' THEN at.weight ELSE 0 END)
                    ELSE NULL
                END
            END ASC NULLS LAST,
            CASE WHEN ${desc} = false THEN
                CASE ${id}
                    WHEN 'full_name' THEN m.full_name
                    WHEN 'job_title' THEN m.job_title
                    WHEN 'emails' THEN m.emails[1]
                    WHEN 'tags' THEN m.tags[0]
                    WHEN 'joined_at' THEN m.joined_at::text
                    WHEN 'locale' THEN m.locale
                    WHEN 'source' THEN CAST(m.source AS TEXT)
                    ELSE NULL
                END
            END ASC NULLS LAST
        LIMIT 50
        OFFSET ${page * 50}
      `;

      return MemberWithActivitiesSchema.array().parse(members);
    },
  );
