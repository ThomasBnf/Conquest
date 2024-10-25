import { AppSidebar } from "@/components/layouts/app-sidebar";
import { UserProvider } from "@/context/userContext";
import { getCurrentUser } from "@/helpers/getCurrentUser";
import { SidebarProvider } from "@conquest/ui/sidebar";
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
  const user = await getCurrentUser();

  if (!user.onboarding) redirect("/");
  if (user.workspace.slug !== slug) redirect(`/${user.workspace.slug}`);

  return (
    <SidebarProvider>
      <UserProvider user={user}>
        <AppSidebar />
        <div className="flex-1 h-dvh overflow-hidden">{children}</div>
      </UserProvider>
    </SidebarProvider>
  );
}
