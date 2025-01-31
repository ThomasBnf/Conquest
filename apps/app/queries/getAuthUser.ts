import { auth } from "@/auth";
import { prisma } from "@conquest/db/prisma";
import { UserWithWorkspaceSchema } from "@conquest/zod/schemas/user.schema";
import type { Context } from "hono";

export const getAuthUser = async (c: Context) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Session not found!");
  }

  const user = await prisma.users.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      workspace: {
        include: {
          integrations: true,
        },
      },
    },
    omit: {
      hashed_password: true,
    },
  });

  if (!user) {
    throw new Error("User not found!");
  }

  return UserWithWorkspaceSchema.omit({
    hashed_password: true,
  }).parse(user);
};
