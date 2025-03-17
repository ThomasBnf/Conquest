"use client";

import { Companies } from "@/components/icons/Companies";
import { Dashboard } from "@/components/icons/Dashboard";
import { Members } from "@/components/icons/Members";
import { useUser } from "@/context/userContext";
import { WorkspaceMenu } from "@/features/workspaces/workspace-menu";
import { useOpenList } from "@/hooks/useOpenList";
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Documentation } from "../icons/Documentation";
import { Settings } from "../icons/Settings";
import { SlackCommunity } from "../icons/Slack-Community";
import { LoadingIntegrations } from "../states/loading-integrations";
import { SidebarLists } from "./sidebar-lists";
import { TrialCard } from "./trial-card";

type Props = {
  workspace: Workspace | undefined;
};

export const AppSidebar = ({ workspace }: Props) => {
  const { slug } = useUser();
  const { state } = useSidebar();
  const { setOpen } = useOpenList();
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: <Dashboard size={18} />,
      href: `/${slug}`,
      isActive: pathname === `/${slug}`,
    },
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
                >
                  <Link href={route.href}>
                    {route.icon}
                    <span>{route.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {state === "expanded" && <SidebarLists />}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footer.map((route) => (
            <SidebarMenuItem key={route.label}>
              <SidebarMenuButton asChild tooltip={route.label}>
                <Link href={route.href}>
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
                <Link href={route.href} target="_blank">
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
