import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";

type Props = {
  cursor?: number | null | undefined;
  search: string;
  workspace_id: string;
};

export const listInfiniteMembers = async ({
  cursor,
  search,
  workspace_id,
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
        ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
