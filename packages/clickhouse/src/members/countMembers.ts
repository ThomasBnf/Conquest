import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";

type Props = {
  search: string;
  groupFilters: GroupFilters;
  workspace_id: string;
};

export const countMembers = async ({
  search,
  groupFilters,
  workspace_id,
}: Props) => {
  const { operator } = groupFilters;

  const searchParsed = search?.toLowerCase().trim();
  const filterBy = getFilters({ groupFilters });

  const profileJoin = groupFilters.filters.some(
    (filter) =>
      filter.field === "profiles" ||
      filter.field.includes("discourse-") ||
      filter.field.includes("github-"),
  );

  const result = await client.query({
    query: `
        SELECT count(*) as total
        FROM member AS m FINAL
        LEFT JOIN level AS l ON m.level_id = l.id
        LEFT JOIN company AS c ON m.company_id = c.id
        ${
          profileJoin
            ? `LEFT JOIN (
                SELECT 
                  member_id,
                  groupArray(attributes) as attributes
                FROM profile
                GROUP BY member_id
              ) p ON m.id = p.member_id`
            : ""
        }
        WHERE m.workspace_id = '${workspace_id}'
        ${
          search
            ? `AND (
                concat(first_name, ' ', last_name) LIKE '%${searchParsed}%'
                OR primary_email LIKE '%${searchParsed}%'
              )`
            : ""
        }
        ${filterBy.length > 0 ? `AND (${filterBy.join(operator === "OR" ? " OR " : " AND ")})` : ""}
      `,
  });

  const { data } = await result.json();
  const count = data as Array<{ total: number }>;
  return Number(count[0]?.total);
};
