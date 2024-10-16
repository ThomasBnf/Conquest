import { prisma } from "lib/prisma";

type Props = {
  external_id: string;
  name: string;
};

export const updateChannel = async ({ external_id, name }: Props) => {
  return await prisma.channel.update({
    where: {
      external_id,
    },
    data: {
      name,
    },
  });
};
