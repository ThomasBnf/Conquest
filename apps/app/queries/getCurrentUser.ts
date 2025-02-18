import { auth } from "@/auth";
import { prisma } from "@conquest/db/prisma";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    omit: {
      hashed_password: true,
    },
  });

  if (!user) redirect("/auth/login");

  return UserSchema.omit({
    hashed_password: true,
  }).parse(user);
};
