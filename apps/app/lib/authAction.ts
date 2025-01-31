import { auth } from "@/auth";
import { prisma } from "@conquest/db/prisma";
import { UserWithWorkspaceSchema } from "@conquest/zod/schemas/user.schema";
import { safeAction } from "./safeAction";

export const authAction = safeAction.use(async ({ next }) => {
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

  return next({
    ctx: {
      user: UserWithWorkspaceSchema.omit({
        hashed_password: true,
      }).parse(user),
    },
  });
});
