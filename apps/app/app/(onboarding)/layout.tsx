import { getCurrentUser } from "@/helpers/getCurrentUser";
import { UserProvider } from "context/userContext";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");
  if (user.onboarding) redirect(`/w/${user.workspace.slug}`);

  return <UserProvider user={user}>{children}</UserProvider>;
}
