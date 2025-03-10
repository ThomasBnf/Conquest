import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const deleteEvent = async ({ id }: Props) => {
  await prisma.event.delete({
    where: { id },
  });
};
