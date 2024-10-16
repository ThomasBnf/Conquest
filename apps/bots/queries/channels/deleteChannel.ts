import { prisma } from "lib/prisma";

type Props = {
  external_id: string;
};

export const deleteChannel = async ({ external_id }: Props) => {
  return await prisma.channel.delete({
    where: {
      external_id,
    },
  });
};
