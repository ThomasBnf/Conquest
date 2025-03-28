import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";

type Props = {
  search: string;
  workspace_id: string;
  cursor?: number | null | undefined;
  limit?: number;
};

export const listPaginatedMembers = async ({
  search,
  workspace_id,
  limit,
  cursor,
}: Props) => {
  const result = await client.query({
    query: `
        SELECT *
        FROM member FINAL
        WHERE (
          lower(first_name) LIKE lower('%${search}%')
          OR lower(last_name) LIKE lower('%${search}%')
          OR lower(primary_email) LIKE lower('%${search}%')
        )
        AND workspace_id = '${workspace_id}'
        ORDER BY first_name ASC
        ${limit ? `LIMIT ${limit}` : ""}
        ${cursor ? `OFFSET ${cursor}` : ""}
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
