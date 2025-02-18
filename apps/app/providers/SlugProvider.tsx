"use client";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { IsLoading } from "@/components/states/is-loading";
import { UserProvider } from "@/context/userContext";
import { trpc } from "@/server/client";
import { SidebarProvider } from "@conquest/ui/sidebar";

type Props = {
  defaultOpen: boolean;
  children: React.ReactNode;
};

export const SlugProvider = ({ defaultOpen, children }: Props) => {
  const results = trpc.useQueries((user) => [
    user.users.getCurrentUser(),
    user.workspaces.getWorkspace(),
  ]);

  const [user, workspace] = results;

  if (results.some((result) => result.isLoading)) return <IsLoading />;

  return (
    <UserProvider user={user.data} workspace={workspace.data}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar workspace={workspace.data} />
        <main className="h-dvh flex-1 overflow-hidden">{children}</main>
      </SidebarProvider>
    </UserProvider>
  );
};
