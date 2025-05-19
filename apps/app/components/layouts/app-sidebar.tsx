"use client";

import { WorkspaceMenu } from "@/features/workspaces/workspace-menu";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { Companies } from "@conquest/ui/icons/Companies";
import { Dashboard } from "@conquest/ui/icons/Dashboard";
import { Documentation } from "@conquest/ui/icons/Documentation";
import { Members } from "@conquest/ui/icons/Members";
import { Settings } from "@conquest/ui/icons/Settings";
import { SlackCommunity } from "@conquest/ui/icons/Slack-Community";
import { Workflows } from "@conquest/ui/icons/Workflows";
import { Separator } from "@conquest/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@conquest/ui/sidebar";
import type { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoadingIntegrations } from "../states/loading-integrations";
import { DuplicateMenu } from "./duplicate-menu";
import { SidebarLists } from "./sidebar-lists";
import { TrialCard } from "./trial-card";

type Props = {
  workspace: Workspace | undefined;
};

export const AppSidebar = ({ workspace }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user.workspace ?? {};
  const { state } = useSidebar();
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: <Dashboard size={18} />,
      href: `/${slug}`,
      isActive: pathname === `/${slug}`,
    },
    // {
    //   label: "Tasks",
    //   icon: <Tasks size={18} />,
    //   href: `/${slug}/tasks`,
    //   isActive: pathname.startsWith(`/${slug}/tasks`),
    // },
    {
      label: "Members",
      icon: <Members size={18} />,
      href: `/${slug}/members`,
      isActive: pathname.startsWith(`/${slug}/members`),
    },
    {
      label: "Companies",
      icon: <Companies size={18} />,
      href: `/${slug}/companies`,
      isActive: pathname.startsWith(`/${slug}/companies`),
    },
    {
      label: "Workflows",
      icon: <Workflows size={18} />,
      href: `/${slug}/workflows`,
      isActive: pathname.startsWith(`/${slug}/workflows`),
      isBeta: true,
    },
  ];

  const footer = [
    {
      label: "Settings",
      icon: <Settings size={18} />,
      href: "/settings",
    },
  ];

  const links = [
    {
      label: "Documentation",
      icon: <Documentation size={18} />,
      href: "https://docs.useconquest.com",
    },
    {
      label: "Community",
      icon: <SlackCommunity size={18} />,
      href: "https://join.slack.com/t/useconquest/shared_invite/zt-2x4fg4fut-7k0G3_D649TkfPc5WIPdgA",
    },
  ];

  return (
    <Sidebar collapsible="icon" className="z-50">
      <SidebarHeader>
        <WorkspaceMenu workspace={workspace} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.label}>
                <SidebarMenuButton
                  asChild
                  tooltip={route.label}
                  isActive={route.isActive}
                  disabled={route.isBeta}
                  className={cn(route.isBeta && "opacity-50")}
                >
                  <Link href={route.isBeta ? "" : route.href} prefetch>
                    {route.icon}
                    <span>{route.label}</span>
                    {route.isBeta && <Badge variant="secondary">Beta</Badge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <DuplicateMenu />
          </SidebarMenu>
        </SidebarGroup>
        {state === "expanded" && <SidebarLists />}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footer.map((route) => (
            <SidebarMenuItem key={route.label}>
              <SidebarMenuButton asChild tooltip={route.label}>
                <Link href={route.href} prefetch>
                  {route.icon}
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Separator />
        <SidebarMenu>
          {links.map((route) => (
            <SidebarMenuItem key={route.label}>
              <SidebarMenuButton asChild tooltip={route.label}>
                <Link href={route.href} target="_blank" prefetch>
                  {route.icon}
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <LoadingIntegrations />
      <TrialCard />
      <SidebarRail />
    </Sidebar>
  );
};
