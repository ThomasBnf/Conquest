import { prisma } from "@conquest/database";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { Prisma } from "@prisma/client";
import { getFilters } from "../helpers/getFilters";

type Props = {
  search: string;
  filters: Filter[];
  workspace_id: string;
};

export const countMembers = async ({
  search,
  filters,
  workspace_id,
}: Props) => {
  const searchParsed = search?.toLowerCase().trim();
  const filterBy = getFilters({ filters });

  const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT m.id)::bigint as count
        FROM members m
        LEFT JOIN companies c ON m.company_id = c.id
        WHERE 
          (
            LOWER(COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(m.primary_email) LIKE '%' || ${searchParsed} || '%'
            OR EXISTS (
              SELECT 1 FROM unnest(m.phones) phone
              WHERE LOWER(phone) LIKE '%' || ${searchParsed} || '%'
            )
          )
          AND m.workspace_id = ${workspace_id}
          ${
            filterBy.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterBy, " AND ")})`
              : Prisma.sql``
          }
      `;

  return Number(count);
};
