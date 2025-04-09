import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const checkDuplicates = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT
        'email' AS duplicate_type,
        m.primary_email AS value,
        groupArray(m.id) AS member_ids
      FROM member m FINAL
      WHERE m.primary_email != '' AND m.workspace_id = '${workspace_id}'
      GROUP BY m.primary_email
      HAVING count() > 1

      UNION ALL

      SELECT
        'name' AS duplicate_type,
        concat(m.first_name, ' ', m.last_name) AS value,
        groupArray(m.id) AS member_ids
      FROM member m FINAL
      WHERE m.first_name != '' AND m.last_name != '' AND m.workspace_id = '${workspace_id}'
      GROUP BY m.first_name, m.last_name
      HAVING count() > 1
    `,
    format: "JSON",
  });

  const { data } = (await result.json()) as {
    data: { duplicate_type: string; value: string; member_ids: string[] }[];
  };
  return data;
};
