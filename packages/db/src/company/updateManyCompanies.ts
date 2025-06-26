import type { Company } from "@conquest/zod/schemas/company.schema";
import { prisma } from "../prisma";

type Props = {
  companies: Company[];
};

export const updateManyCompanies = async ({ companies }: Props) => {
  await prisma.$transaction(
    companies.map(({ id, tags, ...data }) =>
      prisma.company.update({
        where: { id },
        data: {
          ...data,
          tags,
        },
      }),
    ),
  );
};
