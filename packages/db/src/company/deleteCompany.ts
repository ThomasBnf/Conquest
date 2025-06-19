import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteCompany = async ({ id }: Props) => {
  await prisma.$transaction(async (tx) => {
    await tx.member.updateMany({
      where: {
        id,
      },
      data: {
        companyId: null,
      },
    });

    await tx.company.delete({
      where: {
        id,
      },
    });
  });
};
