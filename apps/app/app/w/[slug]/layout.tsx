import { AppSidebar } from "@/components/layouts/app-sidebar";
import { SidebarProvider } from "@conquest/ui/sidebar";
import { getCurrentUser } from "actions/users/getCurrentUser";
import { UserProvider } from "context/userContext";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

type Props = {
  params: {
    slug: string;
  };
};

export default async function Layout({
  children,
  params: { slug },
}: PropsWithChildren<Props>) {
  const rUser = await getCurrentUser();
  const user = rUser?.data;

  if (!user?.onboarding) redirect("/");
  if (user?.workspace.slug !== slug) redirect(`/w/${user?.workspace.slug}`);

  return (
    <SidebarProvider>
      <UserProvider user={user}>
        <AppSidebar />
        <div className="flex-1 h-dvh overflow-hidden">{children}</div>
      </UserProvider>
    </SidebarProvider>
  );
}
