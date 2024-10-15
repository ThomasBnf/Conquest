"use server";

import { UserWithWorkspaceSchema } from "@conquest/zod/user.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const getCurrentUser = authAction
  .metadata({ name: "getCurrentUser" })
  .action(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user?.id,
      },
      include: {
        workspace: {
          include: {
            integrations: true,
          },
        },
      },
    });

    return UserWithWorkspaceSchema.parse(user);
  });
