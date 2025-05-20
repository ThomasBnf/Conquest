import { prisma } from "@conquest/db/prisma";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { protectedProcedure } from "../trpc";

export const listWorkspaceUsers = protectedProcedure.query(async ({ ctx }) => {
  const { user } = ctx;

  const users = await prisma.userInWorkspace.findMany({
    where: {
      workspaceId: user.workspaceId,
    },
    include: {
      user: true,
    },
  });

  return UserSchema.array().parse(users.map((user) => user.user));
});
