import { AppSidebar } from "@/components/layouts/app-sidebar";
import { FiltersProvider } from "@/context/filtersContext";
import { UserProvider } from "@/context/userContext";
import { CreateListDialog } from "@/features/lists/create-list-dialog";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { getWorkspace } from "@conquest/clickhouse/workspaces/getWorkspace";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
  params: {
    slug: string;
  };
};

export default async function Layout({
  params,
  children,
}: PropsWithChildren<Props>) {
  const user = await getCurrentUser();
  const workspace = await getWorkspace({ id: user.workspace_id });
  const { slug } = workspace ?? {};

  if (!user) redirect("/auth/login");
  if (user && !user.onboarding) redirect("/");
  if (slug !== params.slug) redirect(`/${slug}`);

  const cookieStore = cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <UserProvider>
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
