import { prisma } from "../prisma";

type Props = {
  number: number;
  workspaceId: string;
};

export const deleteLevel = async ({ number, workspaceId }: Props) => {
  await prisma.level.delete({
    where: {
      number_workspaceId: {
        number,
        workspaceId,
      },
    },
  });
};
