import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { prisma } from "../prisma";

type Props = {
  name: string;
  workspaceId: string;
};

export const getCompanyByName = async ({ name, workspaceId }: Props) => {
  const company = await prisma.company.findFirst({
    where: {
      name,
      workspaceId,
    },
  });

  if (!company) return null;
  return CompanySchema.parse(company);
};
