import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { prisma } from "../../prisma";

type Props = {
  company_id: string;
  workspace_id: string;
};

export const getCompany = async ({ company_id, workspace_id }: Props) => {
  const company = await prisma.company.findUnique({
    where: {
      id: company_id,
      workspace_id,
    },
  });

  return CompanySchema.parse(company);
};
