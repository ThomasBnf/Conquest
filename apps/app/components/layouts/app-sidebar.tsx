"use client";

import { Activities } from "@/components/icons/Activities";
import { Companies } from "@/components/icons/Companies";
import { Dashboard } from "@/components/icons/Dashboard";
import { Members } from "@/components/icons/Members";
import { useUser } from "@/context/userContext";
import { WorkspaceMenu } from "@/features/workspaces/workspace-menu";
import { Separator } from "@conquest/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@conquest/ui/sidebar";
import type { List } from "@conquest/zod/schemas/list.schema";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Documentation } from "../icons/Documentation";
import { Settings } from "../icons/Settings";
import { SlackCommunity } from "../icons/Slack-Community";
import { LoadingIntegrations } from "../states/loading-integrations";
import { SidebarSettings } from "./sidebar-settings";

type Props = {
  lists: List[];
};

export const AppSidebar = ({ lists }: Props) => {
  const { slug } = useUser();
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
      label: "Companies",
      icon: <Companies className="size-[18px]" />,
      href: `/${slug}/companies`,
      isActive: pathname.startsWith(`/${slug}/companies`),
    },
    {
      label: "Activities",
      icon: <Activities className="size-[18px]" />,
      href: `/${slug}/activities`,
      isActive: pathname.startsWith(`/${slug}/activities`),
    },
  ];

  const footer = [
    {
      label: "Settings",
      icon: <Settings className="size-[18px]" />,
      href: `/${slug}/settings`,
    },
  ];

  const links = [
    {
      label: "Documentation",
      icon: <Documentation className="size-[18px]" />,
      href: "https://docs.useconquest.com",
    },
    {
      label: "Community",
      icon: <SlackCommunity className="size-[18px]" />,
      href: "https://join.slack.com/t/useconquest/shared_invite/zt-2x4fg4fut-7k0G3_D649TkfPc5WIPdgA",
    },
  ];

  return (
    <Sidebar collapsible="offcanvas">
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
        {lists && lists.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Lists</SidebarGroupLabel>
            <SidebarMenu>
              {lists?.map((list) => (
                <SidebarMenuItem key={list.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(list.id)}
                  >
                    <Link href={`/${slug}/lists/${list.id}`}>
                      <div className="flex items-center gap-2">
                        <p className="text-base">{list.emoji}</p>
                        <p>{list.name}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footer.map((route) => (
            <SidebarMenuItem key={route.label}>
              <SidebarMenuButton asChild>
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
              <SidebarMenuButton asChild>
                <Link href={route.href}>
                  {route.icon}
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <LoadingIntegrations />
      <SidebarRail />
    </Sidebar>
  );
};
