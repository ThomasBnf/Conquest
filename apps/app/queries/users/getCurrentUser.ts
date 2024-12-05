import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserWithWorkspaceSchema } from "@conquest/zod/user.schema";

export const getCurrentUser = async () => {
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
  });

  return UserWithWorkspaceSchema.parse(user);
};
