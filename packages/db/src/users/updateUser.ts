import { type User, UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
} & Partial<User>;

export const updateUser = async ({ id, ...data }: Props) => {
  const user = await prisma.user.update({
    where: {
      id,
    },
    data,
  });

  return UserSchema.parse(user);
};
