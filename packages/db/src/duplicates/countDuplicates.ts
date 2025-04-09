import { prisma } from "../prisma";

type Props = {
  workspace_id: string;
};

export const countDuplicates = async ({ workspace_id }: Props) => {
  const duplicates = await prisma.duplicate.count({
    where: {
      workspace_id,
      state: "PENDING",
    },
  });

  return duplicates;
};
