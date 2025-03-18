import { auth } from "@/auth";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { IsLoading } from "@/components/states/is-loading";
import { FiltersProvider } from "@/context/filtersContext";
import { CreateListDialog } from "@/features/lists/create-list-dialog";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type PropsWithChildren, Suspense } from "react";

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
  const { workspace } = user;

  if (user && !user.onboarding) redirect("/");

  const { is_past_due } = workspace;
  if (is_past_due) redirect("/billing");

  if (slug !== workspace.slug) redirect(`/${workspace.slug}`);

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <FiltersProvider>
        <CreateListDialog />
        <AppSidebar workspace={workspace} />
        <Suspense fallback={<IsLoading />}>
          <main className="h-dvh flex-1 overflow-hidden">{children}</main>
        </Suspense>
      </FiltersProvider>
    </SidebarProvider>
  );
}
