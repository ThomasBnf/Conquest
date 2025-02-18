"use client";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { IsLoading } from "@/components/states/is-loading";
import { FiltersProvider } from "@/context/filtersContext";
import { UserProvider } from "@/context/userContext";
import { CreateListDialog } from "@/features/lists/create-list-dialog";
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
        <FiltersProvider>
          <CreateListDialog />
          <AppSidebar workspace={workspace.data} />
          <main className="h-dvh flex-1 overflow-hidden">{children}</main>
        </FiltersProvider>
      </SidebarProvider>
    </UserProvider>
  );
};
