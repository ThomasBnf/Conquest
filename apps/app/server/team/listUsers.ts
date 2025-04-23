import { prisma } from "@conquest/db/prisma";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { protectedProcedure } from "../trpc";

export const listUsers = protectedProcedure.query(async ({ ctx }) => {
  const { user } = ctx;
  const { workspace_id } = user;

  const usersInWorkspace = await prisma.userInWorkspace.findMany({
    where: {
      workspace_id,
    },
    include: {
      user: true,
    },
  });

  const users = usersInWorkspace.map((user) => user.user);

  return UserSchema.array().parse(users);
});
