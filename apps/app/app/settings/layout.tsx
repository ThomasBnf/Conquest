import { SettingsSidebar } from "@/components/layouts/settings-sidebar";
import { UserProvider } from "@/context/userContext";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: PropsWithChildren<Props>) {
  const user = await getCurrentUser();
  const workspace = await getWorkspace({ id: user.workspace_id });

  if (!user) redirect("/");
  if (!user?.onboarding) redirect("/");

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <UserProvider initialUser={user} initialWorkspace={workspace}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SettingsSidebar />
        <main className="h-dvh flex-1 overflow-hidden">{children}</main>
      </SidebarProvider>
    </UserProvider>
  );
}
