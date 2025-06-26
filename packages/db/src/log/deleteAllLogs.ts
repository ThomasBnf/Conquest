import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const deleteAllLogs = async ({ workspaceId }: Props) => {
  await prisma.log.deleteMany({
    where: {
      workspaceId,
    },
  });
};
