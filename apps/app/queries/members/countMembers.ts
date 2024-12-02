import { prisma } from "@conquest/database";

type Props = {
  workspace_id: string;
};

export const countMembers = async ({ workspace_id }: Props) => {
  const count = await prisma.members.count({
    where: {
      workspace_id,
    },
  });

  return count;
};
