import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { FullMemberSchema } from "@conquest/zod/schemas/member.schema";
import { cleanPrefix } from "../helpers/cleanPrefix";

type Props = {
  cursor: number | null | undefined;
  search: string;
  id: string;
  desc: boolean;
  groupFilters: GroupFilters;
  workspaceId: string;
};

export const listFilteredMembers = async ({
  cursor,
  search,
  id,
  desc,
  groupFilters,
  workspaceId,
}: Props) => {
  const { operator } = groupFilters;

  const filterBy = getFilters({ groupFilters });
  const filtersStr = filterBy.join(operator === "OR" ? " OR " : " AND ");
  const orderBy = orderByParser({ id, desc, type: "members" });

  const result = await client.query({
    query: `
        SELECT 
          m.*,
          c.name as company,
          l.number as level,
          l.name as levelName,
          p.attributes
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
        ${
          search
            ? `AND (
                positionCaseInsensitive(concat(firstName, ' ', lastName), LOWER(trim('${search}'))) > 0
                OR positionCaseInsensitive(primaryEmail, LOWER(trim('${search}'))) > 0
                OR arrayExists(attr -> attr.source = 'Github' AND positionCaseInsensitive(toString(attr.login), LOWER(trim('${search}'))) > 0, p.attributes)
              )`
            : ""
        }
        ${filterBy.length > 0 ? `AND (${filtersStr})` : ""}
        ${orderBy}
        ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
      `,
    format: "JSON",
  });

  const { data } = await result.json();
  const cleanData = cleanPrefix("m.", data);
  return FullMemberSchema.array().parse(cleanData);
};
