import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../prisma";

type Props = {
  email: string;
  hashed_password: string;
  workspace_id: string;
};

export const createUser = async ({
  email,
  hashed_password,
  workspace_id,
}: Props) => {
  const user = await prisma.user.create({
    data: {
      email,
      hashed_password,
      workspace_id,
    },
  });

  return UserSchema.parse(user);
};
