import { AppSidebar } from "@/components/layouts/app-sidebar";
import { IsLoading } from "@/components/states/is-loading";
import { UserProvider } from "@/context/userContext";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  children: React.ReactNode;
  params: Record<string, string>;
};

export default async function Layout({
  children,
  params,
}: PropsWithChildren<Props>) {
  const user = await getCurrentUser();

  if (!user?.onboarding) redirect("/");
  if (user?.workspace.slug !== params.slug) redirect(`/${user.workspace.slug}`);

  const cookieStore = cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  if (!user) return <IsLoading />;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <UserProvider user={user}>
        <AppSidebar />
        <main className="h-dvh flex-1 overflow-hidden">{children}</main>
      </UserProvider>
    </SidebarProvider>
  );
}
