import { auth } from "@/auth";
import { getUserById } from "@conquest/clickhouse/users/getUserById";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login");

  const user = await getUserById({ id: session.user.id });

  if (!user) redirect("/auth/login");

  return UserSchema.parse(user);
};
