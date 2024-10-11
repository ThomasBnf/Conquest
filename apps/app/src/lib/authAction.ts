import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserWithWorkspaceSchema } from "@/schemas/user.schema";
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
      workspace: true,
    },
  });

  return next({ ctx: { user: UserWithWorkspaceSchema.parse(user) } });
});
