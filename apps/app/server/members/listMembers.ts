import { client } from "@conquest/clickhouse/client";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
      page: z.number(),
      pageSize: z.number(),
      groupFilters: GroupFiltersSchema,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, id, desc, page, pageSize, groupFilters } = input;
    const { operator } = groupFilters;

    const hasProfileFilter = groupFilters.filters.some(
      (filter) => filter.field === "linked_profiles",
    );

    const searchParsed = search.toLowerCase().trim();
    const orderBy = orderByParser({ id, desc, type: "members" });
    const filterBy = getFilters({ groupFilters });

    const result = await client.query({
      query: `
        ${
          hasProfileFilter
            ? `
          WITH profile_sources AS (
            SELECT 
              member_id,
              groupArray(DISTINCT JSONExtractString(toString(attributes), 'source')) as sources
            FROM profile
            WHERE workspace_id = '${workspace_id}'
            GROUP BY member_id
          )
        `
            : ""
        }
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
          ${hasProfileFilter ? "ps.sources as profile_sources" : "[] as profile_sources"}
        FROM member m
        LEFT JOIN level l ON m.level_id = l.id
        LEFT JOIN company c ON m.company_id = c.id
        ${hasProfileFilter ? "LEFT JOIN profile_sources ps ON m.id = ps.member_id" : ""}
        WHERE (
          positionCaseInsensitive(concat(toString(first_name), ' ', toString(last_name)), '${searchParsed}') > 0
          OR positionCaseInsensitive(concat(toString(last_name), ' ', toString(first_name)), '${searchParsed}') > 0
          OR positionCaseInsensitive(toString(primary_email), '${searchParsed}') > 0
        )
        AND m.workspace_id = '${workspace_id}'
        ${filterBy.length > 0 ? `AND (${filterBy.join(operator === "OR" ? " OR " : " AND ")})` : ""}
        ${orderBy}
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}
      `,
    });

    const { data } = await result.json();
    return MemberSchema.array().parse(data);
  });
