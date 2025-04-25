import { auth } from "@/auth";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { FiltersProvider } from "@/context/filtersContext";
import { CreateListDialog } from "@/features/lists/create-list-dialog";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { isBefore } from "date-fns";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export default async function Layout({
  params,
  children,
}: PropsWithChildren<Props>) {
  const { slug } = await params;

  const session = await auth();
  if (!session) redirect("/auth/login");

  const { user } = session;
  const { workspace } = user;

  if (user && !user.onboarding) redirect("/");

  const { trialEnd, isPastDue } = workspace;
  const trialEnded = trialEnd && isBefore(trialEnd, new Date());
  if (trialEnded || isPastDue) redirect("/billing");

  if (slug !== workspace.slug) redirect(`/${workspace.slug}`);

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
