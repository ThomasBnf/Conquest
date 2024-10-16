import { prisma } from "@/lib/prisma";

type Props = {
  external_id: string;
};

export const getIntegration = async ({ external_id }: Props) => {
  return await prisma.integration.findUnique({
    where: {
      external_id,
    },
  });
};
