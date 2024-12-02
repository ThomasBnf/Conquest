import { prisma } from "@/lib/prisma";
import { MemberSchema } from "@conquest/zod/member.schema";

type Props = {
  search: string;
  id: string;
  desc: boolean;
  page: number;
  pageSize: number;
  workspace_id: string;
};

export const listMembers = async ({
  search,
  id,
  desc,
  page = 1,
  pageSize = 50,
  workspace_id,
}: Props) => {
  const searchParsed = search.toLowerCase().trim();

  const members = await prisma.$queryRaw`
    SELECT * FROM members m
    WHERE 
      LOWER(COALESCE(m.full_name, '')) LIKE '%' || ${searchParsed} || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(m.emails) email 
        WHERE LOWER(email) LIKE '%' || ${searchParsed} || '%'
      )
      OR EXISTS (
        SELECT 1 FROM unnest(m.phones) phone
        WHERE LOWER(phone) LIKE '%' || ${searchParsed} || '%'
      )
      AND m.workspace_id = ${workspace_id}
    GROUP BY m.id
    ORDER BY 
            CASE WHEN ${desc} = true THEN
                CASE ${id}
                    WHEN 'love' THEN m.love
                    WHEN 'level' THEN m.level
                    ELSE NULL
                END
            END DESC NULLS LAST,
            CASE WHEN ${desc} = true THEN
                CASE ${id}
                    WHEN 'full_name' THEN m.full_name
                    WHEN 'job_title' THEN m.job_title
                    WHEN 'emails' THEN m.emails[0]
                    WHEN 'tags' THEN m.tags[0]
                    WHEN 'joined_at' THEN m.joined_at::text
                    WHEN 'localisation' THEN m.localisation
                    WHEN 'source' THEN m.source::text
                    WHEN 'first_activity' THEN m.first_activity::text
                    WHEN 'last_activity' THEN m.last_activity::text
                    ELSE NULL
                END
            END DESC NULLS LAST,
            CASE WHEN ${desc} = false THEN
                CASE ${id}
                    WHEN 'love' THEN m.love
                    WHEN 'level' THEN m.level
                    ELSE NULL
                END
            END ASC NULLS LAST,
            CASE WHEN ${desc} = false THEN
                CASE ${id}
                    WHEN 'full_name' THEN m.full_name
                    WHEN 'job_title' THEN m.job_title
                    WHEN 'emails' THEN m.emails[0]
                    WHEN 'tags' THEN m.tags[0]
                    WHEN 'joined_at' THEN m.joined_at::text
                    WHEN 'localisation' THEN m.localisation
                    WHEN 'source' THEN m.source::text
                    WHEN 'first_activity' THEN m.first_activity::text
                    WHEN 'last_activity' THEN m.last_activity::text
                    ELSE NULL
                END
            END ASC NULLS LAST
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  return MemberSchema.array().parse(members);
};
