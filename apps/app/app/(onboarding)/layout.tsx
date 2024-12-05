import { UserProvider } from "@/context/userContext";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();

  if (user?.onboarding) redirect(`/${user.workspace.slug}`);

  return <UserProvider user={user}>{children}</UserProvider>;
}
