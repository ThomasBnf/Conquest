import { prisma } from "lib/prisma";

type Props = {
  external_id: string;
  name: string;
};

export const updateChannel = async ({ external_id, name }: Props) => {
  return await prisma.channels.update({
    where: {
      external_id,
    },
    data: {
      name,
    },
  });
};
