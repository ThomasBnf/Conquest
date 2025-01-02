import { prisma } from "@/lib/prisma";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";
import { Prisma } from "@prisma/client";
import { getOrderBy } from "../helpers/getOrderBy";

type Props = {
  search: string;
  id: string;
  desc: boolean;
  page: number;
  pageSize: number;
  workspace_id: string;
};

export const listMembers = async ({
  search,
  id,
  desc,
  page = 1,
  pageSize = 50,
  workspace_id,
}: Props) => {
  const searchParsed = search.toLowerCase().trim();
  const orderBy = getOrderBy(id, desc);

  const members = await prisma.$queryRaw`
    SELECT 
      m.*,
      c.id as company_id,
      c.name as company_name
    FROM members m
    LEFT JOIN companies c ON m.company_id = c.id
    WHERE 
      LOWER(COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
      OR LOWER(COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(m.emails) email 
        WHERE LOWER(email) LIKE '%' || ${searchParsed} || '%'
      )
      OR EXISTS (
        SELECT 1 FROM unnest(m.phones) phone
        WHERE LOWER(phone) LIKE '%' || ${searchParsed} || '%'
      )
      AND m.workspace_id = ${workspace_id}
    GROUP BY m.id, c.id
    ${Prisma.sql([orderBy])}
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  return MemberWithCompanySchema.array().parse(members);
};
