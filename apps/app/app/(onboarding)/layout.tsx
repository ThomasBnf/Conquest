import { UserProvider } from "@/context/userContext";
import { getCurrentUser } from "@/helpers/getCurrentUser";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");
  if (user.onboarding) redirect(`/${user.workspace.slug}`);

  return <UserProvider user={user}>{children}</UserProvider>;
}
