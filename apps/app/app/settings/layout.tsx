import { SettingsSidebar } from "@/components/layouts/settings-sidebar";
import { getCurrentWorkspace } from "@/queries/getCurrentWorkspace";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { isBefore } from "date-fns";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: PropsWithChildren<Props>) {
  const { user, workspace } = await getCurrentWorkspace();
  const { role } = user;
  const { trialEnd, isPastDue } = workspace;

  if (!user?.onboarding) redirect("/user");

  const isStaff = role === "STAFF";
  const trialEnded = trialEnd && isBefore(trialEnd, new Date());

  if (!isStaff && (trialEnded || isPastDue)) redirect("/billing");

  return (
    <SidebarProvider defaultOpen={true}>
      <SettingsSidebar />
      <main className="h-dvh flex-1 overflow-hidden">{children}</main>
    </SidebarProvider>
  );
}
