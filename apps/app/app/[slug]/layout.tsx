import { AppSidebar } from "@/components/layouts/app-sidebar";
import { FiltersProvider } from "@/context/filtersContext";
import { CreateListDialog } from "@/features/lists/create-list-dialog";
import { getCurrentWorkspace } from "@/queries/getCurrentWorkspace";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { isBefore } from "date-fns";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: PropsWithChildren<Props>) {
  const { user, workspace } = await getCurrentWorkspace();
  const { role } = user;
  const { slug, trialEnd, isPastDue } = workspace;

  if (!user?.onboarding) redirect("/user");
  if (slug !== workspace.slug) redirect(`/${workspace.slug}`);

  const isStaff = role === "STAFF";
  const trialEnded = trialEnd && isBefore(trialEnd, new Date());

  if (!isStaff && (trialEnded || isPastDue)) redirect("/billing");

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <FiltersProvider>
        <CreateListDialog />
        <AppSidebar workspace={workspace} />
        <main className="h-dvh flex-1 overflow-hidden">{children}</main>
      </FiltersProvider>
    </SidebarProvider>
  );
}
