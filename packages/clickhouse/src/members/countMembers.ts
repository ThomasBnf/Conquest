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

  const filterBy = getFilters({ groupFilters });

  const result = await client.query({
    query: `
        SELECT count(*) as total
        FROM member m FINAL
        WHERE m.workspace_id = '${workspace_id}'
        ${
          search
            ? `AND (
                positionCaseInsensitive(concat(first_name, ' ', last_name), LOWER(trim('${search}'))) > 0
                OR positionCaseInsensitive(primary_email, LOWER(trim('${search}'))) > 0
                OR arrayExists(attr -> attr.source = 'Github' AND positionCaseInsensitive(toString(attr.login), LOWER(trim('${search}'))) > 0, p.profiles)
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
