import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";

type Props = {
  search: string;
  cursor: string | null | undefined;
  take: number;
  workspace_id: string;
};

export const listPaginatedMembers = async ({
  search,
  cursor,
  take,
  workspace_id,
}: Props) => {
  const result = await client.query({
    query: `
        SELECT *
        FROM member
        WHERE (
          lower(first_name) LIKE lower('%${search}%')
          OR lower(last_name) LIKE lower('%${search}%')
          OR lower(primary_email) LIKE lower('%${search}%')
        )
        AND deleted_at IS NULL
        AND workspace_id = '${workspace_id}'
        ${cursor ? `AND id > '${cursor}'` : ""}
        ORDER BY first_name ASC
        LIMIT ${take}
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
