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
import { Contacts } from "components/icons/Contacts";
import { Dashboard } from "components/icons/Dashboard";
import { LeaderBoard } from "components/icons/Leaderbord";
import { Workflows } from "components/icons/Workflows";
import { useUser } from "context/userContext";
import { WorkspaceMenu } from "features/user/workspace-menu";
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
      label: "Contacts",
      icon: <Contacts className="size-[18px]" />,
      href: `/w/${slug}/contacts`,
      isActive: pathname.startsWith(`/w/${slug}/contacts`),
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
                <SidebarMenuButton asChild>
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
      <SidebarFooter />
    </Sidebar>
  );
};
