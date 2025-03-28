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
        FROM member AS m
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
        WHERE (
          ${
            searchParsed
              ? `
            positionCaseInsensitive(concat(COALESCE(m.first_name, ''), ' ', COALESCE(m.last_name, '')), '${searchParsed}') > 0
            OR positionCaseInsensitive(concat(COALESCE(m.last_name, ''), ' ', COALESCE(m.first_name, '')), '${searchParsed}') > 0
            OR positionCaseInsensitive(m.primary_email, '${searchParsed}') > 0
          `
              : "true"
          }
        )
        AND m.deleted_at IS NULL
        AND m.workspace_id = '${workspace_id}'
        ${filterBy.length > 0 ? `AND (${filterBy.join(operator === "OR" ? " OR " : " AND ")})` : ""}
      `,
  });

  const { data } = await result.json();
  const count = data as Array<{ total: number }>;
  return Number(count[0]?.total);
};
