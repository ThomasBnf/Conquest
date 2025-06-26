import { prisma } from "../prisma";

type Props = {
  ids: string[];
};

export const deleteManyCompanies = async ({ ids }: Props) => {
  await prisma.$transaction(async (tx) => {
    await tx.member.updateMany({
      where: {
        companyId: {
          in: ids,
        },
      },
      data: {
        companyId: null,
      },
    });

    await tx.company.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  });
};
