"use client";

import { Activities } from "@/components/icons/Activities";
import { Companies } from "@/components/icons/Companies";
import { Dashboard } from "@/components/icons/Dashboard";
import { Integration } from "@/components/icons/Integration";
import { Members } from "@/components/icons/Members";
import { Workflows } from "@/components/icons/Workflows";
import { useUser } from "@/context/userContext";
import { WorkspaceMenu } from "@/features/workspaces/workspace-menu";
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
  SidebarRail,
  useSidebar,
} from "@conquest/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@conquest/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "../icons/Settings";
import { Slack } from "../icons/Slack";
import { SidebarSettings } from "./sidebar-settings";

export const AppSidebar = () => {
  const { slug, slack } = useUser();
  const { open } = useSidebar();
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
    {
      label: "Workflows",
      icon: <Workflows className="size-[18px]" />,
      href: `/${slug}/workflows`,
      isActive: pathname.startsWith(`/${slug}/workflows`),
    },
  ];

  return (
    <TooltipProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <WorkspaceMenu />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.label}>
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <SidebarMenuButton asChild isActive={route.isActive}>
                        <Link href={route.href}>
                          {route.icon}
                          <span>{route.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {!open && (
                      <TooltipContent align="center" side="right">
                        {route.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/${slug}/settings`}>
                  <Settings className="size-[18px]" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/${slug}/settings/integrations`}>
                  <Integration className="size-[18px]" />
                  <span>Integrations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarRail />
        </SidebarFooter>
        {slack?.status === "SYNCING" && (
          <div className="flex h-10 items-center gap-2 border-t bg-background px-4 text-sm">
            <Slack size={16} />
            <p>Collecting data</p>
            <Loader className="ml-auto size-4" />
          </div>
        )}
      </Sidebar>
    </TooltipProvider>
  );
};
