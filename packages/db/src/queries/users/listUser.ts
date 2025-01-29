import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../../prisma";

type Props = {
  workspace_id: string;
};

export const listUsers = async ({ workspace_id }: Props) => {
  const users = await prisma.users.findMany({
    where: {
      workspace_id,
    },
  });

  return UserSchema.array().parse(users);
};
