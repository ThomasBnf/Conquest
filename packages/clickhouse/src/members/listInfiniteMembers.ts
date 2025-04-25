import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";

type Props = {
  cursor?: number | null | undefined;
  search: string;
  workspaceId: string;
};

export const listInfiniteMembers = async ({
  cursor,
  search,
  workspaceId,
}: Props) => {
  const result = await client.query({
    query: `
        SELECT *
        FROM member FINAL
        WHERE (
          lower(firstName) LIKE lower('%${search}%')
          OR lower(lastName) LIKE lower('%${search}%')
          OR lower(primaryEmail) LIKE lower('%${search}%')
        )
        AND workspaceId = '${workspaceId}'
        ORDER BY firstName ASC
        ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
