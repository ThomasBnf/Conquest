import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../../prisma";

type Props = {
  workspace_id: string;
};

export const listUsers = async ({ workspace_id }: Props) => {
  const users = await prisma.user.findMany({
    where: {
      workspace_id,
    },
    omit: {
      hashed_password: true,
    },
  });

  return UserSchema.omit({
    hashed_password: true,
  })
    .array()
    .parse(users);
};
