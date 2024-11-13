import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CustomError } from "@/lib/safeRoute";
import { UserWithWorkspaceSchema } from "@conquest/zod/user.schema";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new CustomError("Session not found!", 401);
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

  const parsedUser = UserWithWorkspaceSchema.safeParse(user);

  if (!parsedUser.success) redirect("/auth/login");

  return parsedUser.data;
};
