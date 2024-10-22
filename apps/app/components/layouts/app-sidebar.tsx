"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@conquest/ui/sidebar";
import { Activities } from "components/icons/Activities";
import { Dashboard } from "components/icons/Dashboard";
import { LeaderBoard } from "components/icons/Leaderbord";
import { Members } from "components/icons/Members";
import { Settings } from "components/icons/Settings";
import { SignOut } from "components/icons/SignOut";
import { Workflows } from "components/icons/Workflows";
import { useUser } from "context/userContext";
import { WorkspaceMenu } from "features/user/workspace-menu";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { SidebarSettings } from "./sidebar-settings";

export const AppSidebar = () => {
  const { slug } = useUser();
  const pathname = usePathname();

  if (pathname.startsWith(`/w/${slug}/settings`)) return <SidebarSettings />;

  const routes = [
    {
      label: "Dashboard",
      icon: <Dashboard className="size-[18px]" />,
      href: `/w/${slug}`,
      isActive: pathname === `/w/${slug}`,
    },
    {
      label: "Members",
      icon: <Members className="size-[18px]" />,
      href: `/w/${slug}/members`,
      isActive: pathname.startsWith(`/w/${slug}/members`),
    },
    {
      label: "Leaderboard",
      icon: <LeaderBoard className="size-[18px]" />,
      href: `/w/${slug}/leaderboard`,
      isActive: pathname.startsWith(`/w/${slug}/leaderboard`),
    },
    {
      label: "Activities",
      icon: <Activities className="size-[18px]" />,
      href: `/w/${slug}/activities`,
      isActive: pathname.startsWith(`/w/${slug}/activities`),
    },
    {
      label: "Workflows",
      icon: <Workflows className="size-[18px]" />,
      href: `/w/${slug}/workflows`,
      isActive: pathname.startsWith(`/w/${slug}/workflows`),
    },
  ];

  const onClick = async () => {
    signOut({ callbackUrl: "/auth/login", redirect: true });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <WorkspaceMenu />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.label}>
                <SidebarMenuButton asChild isActive={route.isActive}>
                  <a href={route.href}>
                    {route.icon}
                    <span>{route.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={`/w/${slug}/settings`}>
                <Settings className="size-[18px]" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              onClick={onClick}
              className="cursor-pointer"
            >
              <div>
                <SignOut className="size-[18px]" />
                <span>Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
