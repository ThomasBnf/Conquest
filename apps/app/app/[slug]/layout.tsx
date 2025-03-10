import { auth } from "@/auth";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { FiltersProvider } from "@/context/filtersContext";
import { UserProvider } from "@/context/userContext";
import { CreateListDialog } from "@/features/lists/create-list-dialog";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function Layout({
  params,
  children,
}: PropsWithChildren<Props>) {
  const { slug } = await params;

  const session = await auth();
  if (!session) redirect("/auth/login");

  const { user } = session;
  if (user && !user.onboarding) redirect("/");

  const workspace = await getWorkspace({ id: user.workspace_id });
  if (slug !== workspace.slug) redirect(`/${workspace.slug}`);

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <UserProvider initialUser={user} initialWorkspace={workspace}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <FiltersProvider>
          <CreateListDialog />
          <AppSidebar workspace={workspace} />
          <main className="h-dvh flex-1 overflow-hidden">{children}</main>
        </FiltersProvider>
      </SidebarProvider>
    </UserProvider>
  );
}
