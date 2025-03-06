import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../prisma";

type Props = {
  email: string;
};

export const getUser = async ({ email }: Props) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) return undefined;
  return UserSchema.parse(user);
};
