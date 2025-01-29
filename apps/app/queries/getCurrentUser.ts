import { auth } from "@/auth";
import { prisma } from "@conquest/db/prisma";
import { UserWithWorkspaceSchema } from "@conquest/zod/schemas/user.schema";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login");

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

  if (!user) redirect("/auth/login");

  return UserWithWorkspaceSchema.parse(user);
};
