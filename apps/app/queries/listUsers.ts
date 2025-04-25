import { prisma } from "@conquest/db/prisma";

type Props = {
  workspaceId: string;
};

export const listUsers = async ({ workspaceId }: Props) => {
  const users = await prisma.user.count({
    where: {
      workspaceId,
    },
  });

  return users;
};
