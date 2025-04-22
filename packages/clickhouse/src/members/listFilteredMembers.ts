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
  workspace_id: string;
};

export const listFilteredMembers = async ({
  cursor,
  search,
  id,
  desc,
  groupFilters,
  workspace_id,
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
          l.name as level_name,
          p.attributes
        FROM member m FINAL
        LEFT JOIN level l ON m.level_id = l.id
        LEFT JOIN company c ON m.company_id = c.id
        LEFT JOIN (
          SELECT 
            member_id,
            groupArray(attributes) as attributes
          FROM profile
          GROUP BY member_id
        ) p ON m.id = p.member_id
        WHERE m.workspace_id = '${workspace_id}'
        ${
          search
            ? `AND (
                positionCaseInsensitive(concat(first_name, ' ', last_name), LOWER(trim('${search}'))) > 0
                OR positionCaseInsensitive(primary_email, LOWER(trim('${search}'))) > 0
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
