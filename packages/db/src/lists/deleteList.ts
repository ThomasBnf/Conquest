import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteList = async ({ id }: Props) => {
  await prisma.list.delete({
    where: { id },
  });
};
