"use client";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { UserProvider } from "@/context/userContext";
import { SidebarProvider } from "@conquest/ui/sidebar";
import type { List } from "@conquest/zod/schemas/list.schema";
import type { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";

type Props = {
  user: Omit<UserWithWorkspace, "hashed_password">;
  defaultOpen: boolean;
  lists: List[];
  children: React.ReactNode;
};

export const SlugProvider = ({ user, defaultOpen, lists, children }: Props) => {
  return (
    <UserProvider user={user}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar lists={lists} />
        <main className="h-dvh flex-1 overflow-hidden">{children}</main>
      </SidebarProvider>
    </UserProvider>
  );
};
