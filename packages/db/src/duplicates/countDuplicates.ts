import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const countDuplicates = async ({ workspaceId }: Props) => {
  const duplicates = await prisma.duplicate.count({
    where: {
      workspaceId,
      state: "PENDING",
    },
  });

  return duplicates;
};
