import { prisma } from "@/lib/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";

type Props = {
  search: string;
  id: string;
  desc: boolean;
  page: number;
  pageSize: number;
  workspace_id: string;
};

export const listCompanies = async ({
  search,
  id,
  desc,
  page = 1,
  pageSize = 50,
  workspace_id,
}: Props) => {
  const searchParsed = search.toLowerCase().trim();

  const companies = await prisma.$queryRaw`
    SELECT * FROM companies c
    WHERE 
      LOWER(COALESCE(c.name, '')) LIKE '%' || ${searchParsed} || '%'
      OR LOWER(COALESCE(c.domain, '')) LIKE '%' || ${searchParsed} || '%'
      AND c.workspace_id = ${workspace_id}
    GROUP BY c.id
    ORDER BY 
            CASE WHEN ${desc} = true THEN
                CASE ${id}
                    WHEN 'employees' THEN c.employees
                    ELSE NULL
                END
            END DESC NULLS LAST,
            CASE WHEN ${desc} = true THEN
                CASE ${id}
                    WHEN 'name' THEN c.name
                    WHEN 'industry' THEN c.industry
                    WHEN 'domain' THEN c.domain
                    WHEN 'address' THEN c.address
                    WHEN 'tags' THEN c.tags[0]
                    WHEN 'founded_at' THEN c.founded_at::text
                    WHEN 'source' THEN c.source::text
                    ELSE NULL
                END
            END DESC NULLS LAST,
            CASE WHEN ${desc} = false THEN
                CASE ${id}
                    WHEN 'employees' THEN c.employees
                    ELSE NULL
                END
            END ASC NULLS LAST,
            CASE WHEN ${desc} = false THEN
                CASE ${id}
                    WHEN 'name' THEN c.name
                    WHEN 'industry' THEN c.industry
                    WHEN 'domain' THEN c.domain
                    WHEN 'address' THEN c.address
                    WHEN 'tags' THEN c.tags[0]
                    WHEN 'founded_at' THEN c.founded_at::text
                    WHEN 'source' THEN c.source::text
                    ELSE NULL
                END
            END ASC NULLS LAST
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  return CompanySchema.array().parse(companies);
};
