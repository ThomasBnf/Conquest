import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../../prisma";

type Props = {
  id: string;
};

export const getUser = async ({ id }: Props) => {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      hashed_password: true,
    },
  });

  return UserSchema.omit({
    hashed_password: true,
  }).parse(user);
};
