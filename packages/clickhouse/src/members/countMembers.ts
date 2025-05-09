import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";

type Props = {
  search: string;
  groupFilters: GroupFilters;
  workspaceId: string;
};

export const countMembers = async ({
  search,
  groupFilters,
  workspaceId,
}: Props) => {
  const { operator } = groupFilters;

  const filterBy = getFilters({ groupFilters });

  const result = await client.query({
    query: `
        SELECT 
          count(*) as total
        FROM member m FINAL
        LEFT JOIN level l ON m.levelId = l.id
        LEFT JOIN company c ON m.companyId = c.id
        LEFT JOIN (
          SELECT 
            memberId,
            groupArray(attributes) as attributes
          FROM profile FINAL
          GROUP BY memberId
        ) p ON m.id = p.memberId
        WHERE m.workspaceId = '${workspaceId}'
        AND m.isStaff = 0
        ${
          search
            ? `AND (
                positionCaseInsensitive(concat(firstName, ' ', lastName), LOWER(trim('${search}'))) > 0
                OR positionCaseInsensitive(primaryEmail, LOWER(trim('${search}'))) > 0
                OR arrayExists(attr -> attr.source = 'Github' AND positionCaseInsensitive(toString(attr.login), LOWER(trim('${search}'))) > 0, p.attributes)
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
