"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { UserWithWorkspaceSchema } from "schemas/user.schema";

export const getCurrentUser = authAction
  .metadata({ name: "getCurrentUser" })
  .action(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user?.id,
      },
      include: {
        workspace: true,
      },
    });

    return UserWithWorkspaceSchema.parse(user);
  });
