import { prisma } from "@/lib/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";

type Props = {
  company_id: string;
  workspace_id: string;
};

export const getCompany = async ({ company_id, workspace_id }: Props) => {
  const company = await prisma.companies.findUnique({
    where: {
      id: company_id,
      workspace_id,
    },
  });

  return CompanySchema.parse(company);
};
