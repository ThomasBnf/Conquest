import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteApiKey = async ({ id }: Props) => {
  await prisma.api_key.delete({
    where: { id },
  });
};
