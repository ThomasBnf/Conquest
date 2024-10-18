import { prisma } from "@/lib/prisma";

type Props = {
  external_id: string;
  status: "CONNECTED" | "DISCONNECTED";
};

export const updateIntegration = async ({ external_id, status }: Props) => {
  return await prisma.integration.update({
    where: {
      external_id,
    },
    data: {
      status,
    },
  });
};
