"use client";

import { Companies } from "@/components/icons/Companies";
import { Dashboard } from "@/components/icons/Dashboard";
import { Members } from "@/components/icons/Members";
import { useUser } from "@/context/userContext";
import { MenuList } from "@/features/lists/menu-list";
import { WorkspaceMenu } from "@/features/workspaces/workspace-menu";
import { useOpenList } from "@/hooks/useOpenList";
import { trpc } from "@/server/client";
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
  useSidebar,
} from "@conquest/ui/sidebar";
import type { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Documentation } from "../icons/Documentation";
import { Settings } from "../icons/Settings";
import { SlackCommunity } from "../icons/Slack-Community";
import { LoadingIntegrations } from "../states/loading-integrations";

type Props = {
  workspace: Workspace | undefined;
};

export const AppSidebar = ({ workspace }: Props) => {
  const { slug } = useUser();
  const { state } = useSidebar();
  const { setOpen } = useOpenList();
  const pathname = usePathname();

  const { data: lists } = trpc.lists.list.useQuery();

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
        {state === "expanded" && (
          <SidebarGroup>
            <SidebarGroupLabel>Lists</SidebarGroupLabel>
            <SidebarMenu>
              {lists?.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="justify-center border-border border-dashed bg-background"
                    onClick={() => setOpen(true)}
                  >
                    <Plus size={16} />
                    New List
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {lists?.map((list) => (
                <SidebarMenuItem key={list.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(list.id)}
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/${slug}/lists/${list.id}`}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-base">{list.emoji}</p>
                          <p className="truncate">{list.name}</p>
                        </div>
                      </Link>
                      <MenuList list={list} transparent />
                    </div>
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
      <SidebarRail />
    </Sidebar>
  );
};
