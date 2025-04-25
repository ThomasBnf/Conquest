import { auth } from "@/auth";
import { UserProvider } from "@/context/userContext";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: PropsWithChildren<Props>) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { user } = session;
  if (!user?.onboarding) redirect("/");

  const { trialEnd, isPastDue, slug } = user.workspace ?? {};
  if (!trialEnd && !isPastDue) redirect(`/${slug}`);

  return (
    <UserProvider initialUser={user}>
      <main className="h-dvh flex-1 overflow-hidden">{children}</main>
    </UserProvider>
  );
}
