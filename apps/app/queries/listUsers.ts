import { prisma } from "@conquest/db/prisma";

type Props = {
  workspace_id: string;
};

export const listUsers = async ({ workspace_id }: Props) => {
  const users = await prisma.user.count({
    where: {
      workspace_id,
    },
  });

  return users;
};
