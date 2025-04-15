import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";

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

  const searchParsed = search?.toLowerCase().trim();
  const filterBy = getFilters({ groupFilters });
  const filtersStr = filterBy.join(operator === "OR" ? " OR " : " AND ");

  const profileJoin =
    groupFilters.filters.some(
      (filter) =>
        search ||
        filter.field === "profiles" ||
        filter.field.includes("discourse-") ||
        filter.field.includes("github-"),
    ) || search;

  const orderBy = orderByParser({ id, desc, type: "members" });

  const result = await client.query({
    query: `
        SELECT 
          m.id as id,
          m.first_name,
          m.last_name, 
          m.primary_email,
          m.emails,
          m.phones,
          m.job_title,
          m.avatar_url,
          m.country,
          m.language,
          m.tags as tags,
          m.linkedin_url,
          m.level_id,
          m.pulse,
          m.source as source,
          m.company_id,
          m.workspace_id as workspace_id,
          m.first_activity,
          m.last_activity,
          m.created_at as created_at,
          m.updated_at as updated_at,
          l.number,
          ${profileJoin ? "p.attributes" : ""}
        FROM member m FINAL
        LEFT JOIN level l ON m.level_id = l.id
        LEFT JOIN company c ON m.company_id = c.id
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
                OR arrayExists(attr -> attr.source = 'Github' AND position(lower(toString(attr.login)), lower('${searchParsed}')) > 0, p.attributes)
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
  return MemberSchema.array().parse(data);
};
