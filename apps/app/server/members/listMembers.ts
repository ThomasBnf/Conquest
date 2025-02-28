import { client } from "@conquest/clickhouse/client";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";
import { orderByParser } from "@conquest/clickhouse/helpers/orderByParser";
import { getFilters } from "@conquest/clickhouse/helpers/getFilters";

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

    const searchParsed = search.toLowerCase().trim();
    const orderBy = orderByParser({ id, desc, type: "members" });
    const filterBy = getFilters({ groupFilters });

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
          m.pulse,
          m.source as source,
          m.level_id,
          m.linkedin_url,
          m.company_id,
          m.workspace_id as workspace_id,
          m.first_activity,
          m.last_activity,
          m.created_at as created_at,
          m.updated_at as updated_at,
          ${id === "level" ? "l.number as level_number, l.*" : ""}
          ${id === "company" ? "c.*" : ""}
        FROM members AS m
        ${id === "level" ? "LEFT JOIN levels AS l ON m.level_id = l.id" : ""}
        ${id === "company" ? "LEFT JOIN companies AS c ON m.company_id = c.id" : ""}
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
        AND m.workspace_id = '${workspace_id}'
        ${orderBy}
        LIMIT ${pageSize}
        OFFSET ${page * pageSize}
      `,
    });

    const { data } = await result.json();
    return MemberSchema.array().parse(data);
  });
