import type { Company } from "@conquest/zod/schemas/company.schema";
import { prisma } from "../prisma";

type Props = Company;

export const updateCompany = async ({ id, ...data }: Props) => {
  await prisma.company.update({
    where: {
      id,
    },
    data: {
      ...data
    },
  });
};
