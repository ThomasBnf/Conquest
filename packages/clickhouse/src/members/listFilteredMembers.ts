import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";

type Props = {
  search: string;
  id: string;
  desc: boolean;
  page: number;
  pageSize: number;
  groupFilters: GroupFilters;
  workspace_id: string;
};

export const listFilteredMembers = async ({
  search,
  id,
  desc,
  page,
  pageSize,
  groupFilters,
  workspace_id,
}: Props) => {
  const { operator } = groupFilters;

  const filterBy = getFilters({ groupFilters });
  const filtersStr = filterBy.join(operator === "OR" ? " OR " : " AND ");

  const companyJoin = id === "company";
  const profileJoin = groupFilters.filters.some(
    (filter) =>
      filter.field === "profiles" ||
      filter.field.includes("discourse-") ||
      filter.field.includes("github-"),
  );

  const orderBy = orderByParser({ id, desc, type: "members" });

  const result = await client.query({
    query: `
        SELECT 
          m.id as id,
          m.first_name,
          m.last_name, 
          m.primary_email,
          m.secondary_emails,
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
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        ${companyJoin ? "LEFT JOIN company c ON m.company_id = c.id" : ""}
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
          positionCaseInsensitive(concat(toString(first_name), ' ', toString(last_name)), '${search}') > 0
          OR positionCaseInsensitive(concat(toString(last_name), ' ', toString(first_name)), '${search}') > 0
          OR positionCaseInsensitive(toString(primary_email), '${search}') > 0
        )
        AND m.deleted_at IS NULL
        AND m.workspace_id = '${workspace_id}'
        ${filterBy.length > 0 ? `AND (${filtersStr})` : ""}
        ${orderBy}
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}
      `,
    format: "JSON",
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
