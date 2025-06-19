import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { prisma } from "../prisma";

type Props = {
  domain: string;
  workspaceId: string;
};

export const getCompanyByDomain = async ({ domain, workspaceId }: Props) => {
  const company = await prisma.company.findFirst({
    where: {
      domain,
      workspaceId,
    },
  });

  if (!company) return null;
  return CompanySchema.parse(company);
};
