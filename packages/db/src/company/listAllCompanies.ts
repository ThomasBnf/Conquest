import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId?: string;
};

export const listAllCompanies = async ({ workspaceId }: Props) => {
  const companies = await prisma.company.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return CompanySchema.array().parse(companies);
};
