"use client";

import { Activities } from "@/components/icons/Activities";
import { Companies } from "@/components/icons/Companies";
import { Dashboard } from "@/components/icons/Dashboard";
import { Members } from "@/components/icons/Members";
import { useUser } from "@/context/userContext";
import { WorkspaceMenu } from "@/features/workspaces/workspace-menu";
import { Loader } from "@conquest/ui/loader";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@conquest/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Discourse } from "../icons/Discourse";
import { Documentation } from "../icons/Documentation";
import { Integration } from "../icons/Integration";
import { Linkedin } from "../icons/Linkedin";
import { Livestorm } from "../icons/Livestorm";
import { Settings } from "../icons/Settings";
import { Slack } from "../icons/Slack";
import { SlackCommunity } from "../icons/Slack-Community";
import { SidebarSettings } from "./sidebar-settings";

export const AppSidebar = () => {
  const { slug, discourse, linkedin, livestorm, slack } = useUser();
  if (!slug) return null;

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
      label: "Integrations",
      icon: <Integration className="size-[18px]" />,
      href: `/${slug}/settings/integrations`,
    },
    // {
    //   label: "Workflows",
    //   icon: <Workflows className="size-[18px]" />,
    //   href: `/${slug}/workflows`,
    //   isActive: pathname.startsWith(`/${slug}/workflows`),
    // },
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
          <SidebarRail />
        </SidebarFooter>
        {[
          { integration: discourse, Icon: Discourse },
          { integration: linkedin, Icon: Linkedin },
          { integration: livestorm, Icon: Livestorm },
          { integration: slack, Icon: Slack },
        ].map(
          ({ integration, Icon }) =>
            integration?.status === "SYNCING" && (
              <div
                key={integration.id}
                className="flex h-10 items-center gap-2 border-t bg-background px-4 text-sm"
              >
                <Icon size={16} />
                <p>Collecting data</p>
                <Loader className="ml-auto size-4" />
              </div>
            ),
        )}
      </Sidebar>
    </TooltipProvider>
  );
};
