import { getCurrentUser } from "actions/users/getCurrentUser";
import { UserProvider } from "context/userContext";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const rUser = await getCurrentUser();
  const user = rUser?.data;

  if (!user) redirect("/auth/login");
  if (user.onboarding) redirect(`/${user.workspace.slug}`);

  return <UserProvider user={user}>{children}</UserProvider>;
}
