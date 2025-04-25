import { client } from "../client";

type Props = {
  workspaceId: string;
};

export const checkDuplicates = async ({ workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT
        'email' AS duplicate_type,
        m.primaryEmail AS value,
        groupArray(m.id) AS memberIds
      FROM member m FINAL
      WHERE m.primaryEmail != '' AND m.workspaceId = '${workspaceId}'
      GROUP BY m.primaryEmail
      HAVING count() > 1

      UNION ALL

      SELECT
        'name' AS duplicate_type,
        concat(m.firstName, ' ', m.lastName) AS value,
        groupArray(m.id) AS memberIds
      FROM member m FINAL
      WHERE m.firstName != '' AND m.lastName != '' AND m.workspaceId = '${workspaceId}'
      GROUP BY m.firstName, m.lastName
      HAVING count() > 1
    `,
    format: "JSON",
  });

  const { data } = (await result.json()) as {
    data: {
      duplicateType: string;
      value: string;
      memberIds: string[];
    }[];
  };
  return data;
};
