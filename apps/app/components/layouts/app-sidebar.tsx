"use client";

import { useUser } from "@/context/userContext";
import { WorkspaceMenu } from "@/features/workspaces/components/workspace-menu";
import { Loader } from "@conquest/ui/loader";
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
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Integration } from "../icons/Integration";
import { SidebarSettings } from "./sidebar-settings";

export const AppSidebar = () => {
  const { slug, slack } = useUser();
  const pathname = usePathname();

  if (pathname.startsWith(`/${slug}/settings`)) return <SidebarSettings />;

  const routes = [
    {
      label: "Dashboard",
      icon: <Dashboard className="size-[18px]" />,
      href: `/${slug}`,
      isActive: pathname === `/${slug}`,
    },
    {
      label: "Members",
      icon: <Members className="size-[18px]" />,
      href: `/${slug}/members`,
      isActive: pathname.startsWith(`/${slug}/members`),
    },
    {
      label: "Leaderboard",
      icon: <LeaderBoard className="size-[18px]" />,
      href: `/${slug}/leaderboard`,
      isActive: pathname.startsWith(`/${slug}/leaderboard`),
    },
    {
      label: "Activities",
      icon: <Activities className="size-[18px]" />,
      href: `/${slug}/activities`,
      isActive: pathname.startsWith(`/${slug}/activities`),
    },
    {
      label: "Workflows",
      icon: <Workflows className="size-[18px]" />,
      href: `/${slug}/workflows`,
      isActive: pathname.startsWith(`/${slug}/workflows`),
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
                  <Link href={route.href}>
                    {route.icon}
                    <span>{route.label}</span>
                  </Link>
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
              <Link href={`/${slug}/settings/integrations`}>
                <Integration className="size-[18px]" />
                <span>Integrations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={`/${slug}/settings`}>
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
      {slack?.status === "SYNCING" && (
        <div className="border-t h-10 px-4 text-sm flex items-center gap-2 bg-background">
          <Image src="/social/slack.svg" alt="Slack" width={16} height={16} />
          <p>Collecting data</p>
          <Loader className="size-4 ml-auto" />
        </div>
      )}
    </Sidebar>
  );
};
