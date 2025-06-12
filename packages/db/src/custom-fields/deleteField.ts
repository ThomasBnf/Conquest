import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteField = async ({ id }: Props) => {
  await prisma.customField.delete({
    where: { id },
  });
};
