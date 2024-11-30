"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@conquest/database";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import {
  FilterActivitySchema,
  FilterNumberSchema,
  FilterSchema,
  FilterSelectSchema,
  FilterTextSchema,
} from "@conquest/zod/filters.schema";
import { z } from "zod";

export const _listMembers = authAction
  .metadata({ name: "_listMembers" })
  .schema(
    z.object({
      search: z.string(),
      page: z.number(),
      id: z.string(),
      desc: z.boolean(),
      filters: z.array(FilterSchema).optional(),
    }),
  )
  .action(
    async ({
      ctx: { user },
      parsedInput: { search, page, id, desc, filters },
    }) => {
      const workspace_id = user.workspace_id;

      const filterConditions =
        filters?.map((filter) => {
          if (filter.type === "text") {
            const { value, operator, field } = FilterTextSchema.parse(filter);
            const fieldCondition = Prisma.raw(field);
            const likePattern = `%${value}%`;

            switch (operator) {
              case "contains":
                return Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`;
              case "not_contains":
                return Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
              default:
                return Prisma.sql`TRUE`;
            }
          }

          if (filter.type === "select") {
            const { values, operator, field } =
              FilterSelectSchema.parse(filter);
            const fieldCondition = Prisma.raw(field);
            const likePattern = `%${values.join(",")}%`;

            switch (operator) {
              case "contains":
                return Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`;
              case "not_contains":
                return Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
              default:
                return Prisma.sql`TRUE`;
            }
          }

          if (filter.type === "number") {
            const { value, operator, field } = FilterNumberSchema.parse(filter);
            const fieldCondition = Prisma.raw(field);

            switch (operator) {
              case ">":
                return Prisma.sql`m.${fieldCondition} > ${value}`;
              case ">=":
                return Prisma.sql`m.${fieldCondition} >= ${value}`;
              case "=":
                return Prisma.sql`m.${fieldCondition} = ${value}`;
              case "!=":
                return Prisma.sql`m.${fieldCondition} != ${value}`;
              case "<":
                return Prisma.sql`m.${fieldCondition} < ${value}`;
              case "<=":
                return Prisma.sql`m.${fieldCondition} <= ${value}`;
              default:
                return Prisma.sql`TRUE`;
            }
          }

          if (filter.type === "activity" && filter.activity_type.length) {
            const {
              activity_type,
              operator,
              value: count,
              dynamic_date,
            } = FilterActivitySchema.parse(filter);

            if (activity_type.length === 0) return Prisma.sql`TRUE`;
            const intervalStr = `'${dynamic_date}'::interval`;

            return Prisma.sql`(
              SELECT COUNT(*)::integer
              FROM activities a2
              JOIN activities_types at2 ON a2.activity_type_id = at2.id
              WHERE a2.member_id = m.id
              AND at2.key = ANY(${Prisma.raw(
                `ARRAY[${activity_type.map((v) => `'${v.key}'`).join(",")}]`,
              )})
              AND a2.created_at > NOW() - ${Prisma.raw(intervalStr)}
            ) ${Prisma.raw(operator)} ${count}`;
          }

          return Prisma.sql`TRUE`;
        }) ?? [];

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
            AND (m.search::text ILIKE ${`%${search}%`})
            ${
              filterConditions.length > 0
                ? Prisma.sql`AND (${Prisma.join(filterConditions, " AND ")})`
                : Prisma.sql``
            }
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
                    WHEN 'emails' THEN array_to_string(m.emails, ',')
                    WHEN 'tags' THEN array_to_string(m.tags, ',')
                    WHEN 'joined_at' THEN m.joined_at::text
                    WHEN 'localisation' THEN m.localisation
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
                    WHEN 'emails' THEN array_to_string(m.emails, ',')
                    WHEN 'tags' THEN array_to_string(m.tags, ',')
                    WHEN 'joined_at' THEN m.joined_at::text
                    WHEN 'localisation' THEN m.localisation
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
