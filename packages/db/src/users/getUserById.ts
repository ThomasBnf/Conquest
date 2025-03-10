import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const getUserById = async ({ id }: Props) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) return null;
  return UserSchema.parse(user);
};
