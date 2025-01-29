import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../../prisma";

type Props = {
  id: string;
};

export const getUser = async ({ id }: Props) => {
  const user = await prisma.users.findUnique({
    where: { id },
  });

  return UserSchema.parse(user);
};
