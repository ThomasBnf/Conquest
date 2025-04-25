import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteApiKey = async ({ id }: Props) => {
  await prisma.apiKey.delete({
    where: { id },
  });
};
