import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const getCompany = async ({ id }: Props) => {
  const company = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!company) return null;
  return CompanySchema.parse(company);
};
