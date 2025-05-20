"use client";

import { useGetSlug } from "@/hooks/useGetSlug";
import { APIKey } from "@conquest/ui/icons/APIKey";
import { ActivityType } from "@conquest/ui/icons/ActivityType";
import { Billing } from "@conquest/ui/icons/Billing";
import { General } from "@conquest/ui/icons/General";
import { Integration } from "@conquest/ui/icons/Integration";
import { Level } from "@conquest/ui/icons/Level";
import { Tags } from "@conquest/ui/icons/Tags";
import { User } from "@conquest/ui/icons/User";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@conquest/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoadingIntegrations } from "../states/loading-integrations";
import { TrialCard } from "./trial-card";

export const SettingsSidebar = () => {
  const pathname = usePathname();
  const slug = useGetSlug();

  const menu = [
    {
      label: "Account",
      routes: [
        {
          icon: <User size={18} />,
          label: "Profile",
          href: "/settings",
          isActive: pathname === "/settings",
        },
      ],
    },
    {
      label: "Workspace",
      routes: [
        {
          icon: <General size={18} />,
          label: "General",
          href: "/settings/workspace",
          isActive: pathname === "/settings/workspace",
        },
        {
          icon: <Billing size={18} />,
          label: "Billing",
          href: "/settings/billing",
          isActive: pathname === "/settings/billing",
        },
        // {
        //   icon: <Members size={18} />,
        //   label: "Team",
        //   href: "/settings/team",
        //   isActive: pathname === "/settings/team",
        // },
      ],
    },
    {
      label: "System",
      routes: [
        {
          icon: <Tags size={18} />,
          label: "Tags",
          href: "/settings/tags",
          isActive: pathname.startsWith("/settings/tags"),
        },
        {
          icon: <ActivityType size={18} />,
          label: "Activity Types",
          href: "/settings/activity-types",
          isActive: pathname.startsWith("/settings/activity-types"),
        },
        {
          icon: <Level size={18} />,
          label: "Member Levels",
          href: "/settings/member-level",
          isActive: pathname.startsWith("/settings/member-level"),
        },
        {
          icon: <Integration size={18} />,
          label: "Integrations",
          href: "/settings/integrations",
          isActive: pathname.startsWith("/settings/integrations"),
        },
      ],
    },
    {
      label: "Developer",
      routes: [
        {
          icon: <APIKey size={18} />,
          label: "API Keys",
          href: "/settings/api-keys",
          isActive: pathname.startsWith("/settings/api-keys"),
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-fit">
              <Link href={`/${slug}`} prefetch>
                <ArrowLeft />
                Back to dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menu.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.routes.map((route) => (
                <SidebarMenuItem key={route.label}>
                  <SidebarMenuButton asChild isActive={route.isActive}>
                    <Link href={route.href} prefetch>
                      {route.icon}
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <LoadingIntegrations />
      <TrialCard />
    </Sidebar>
  );
};
