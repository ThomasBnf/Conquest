import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { prisma } from "../../prisma";

type Props = {
  id: string;
};

export const updateUser = async ({ id }: Props) => {
  const user = await prisma.users.update({
    where: { id },
    data: {
      last_seen: new Date(),
    },
  });

  return UserSchema.parse(user);
};
