import { prisma } from "../../prisma";

type Props = {
  id: string;
};

export const deleteMember = async ({ id }: Props) => {
  return await prisma.member.delete({
    where: {
      id,
    },
  });
};
