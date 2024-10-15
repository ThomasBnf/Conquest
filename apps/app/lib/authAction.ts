import { UserWithWorkspaceSchema } from "@conquest/zod/user.schema";
import { auth } from "auth";
import { prisma } from "lib/prisma";
import { safeAction } from "./safeAction";

export const authAction = safeAction.use(async ({ next }) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Session not found!");
  }

  const user = await prisma.user.findUnique({
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
  });

  return next({ ctx: { user: UserWithWorkspaceSchema.parse(user) } });
});
