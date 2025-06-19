import { prisma } from "../prisma";

type Props = {
  key: string;
  workspaceId: string;
};

export const deleteActivityType = async ({ key, workspaceId }: Props) => {
  return await prisma.activityType.delete({
    where: {
      key,
      workspaceId,
    },
  });
};
