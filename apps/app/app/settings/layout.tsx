import { auth } from "@/auth";
import { SettingsSidebar } from "@/components/layouts/settings-sidebar";
import { UserProvider } from "@/context/userContext";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { isBefore } from "date-fns";
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

  const { trialEnd, isPastDue } = user.workspace;
  const trialEnded = trialEnd && isBefore(trialEnd, new Date());
  if (trialEnded || isPastDue) redirect("/billing");

  return (
    <UserProvider initialUser={user}>
      <SidebarProvider defaultOpen={true}>
        <SettingsSidebar />
        <main className="h-dvh flex-1 overflow-hidden">{children}</main>
      </SidebarProvider>
    </UserProvider>
  );
}
