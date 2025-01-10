"use client";

import { useUser } from "@/context/userContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@conquest/ui/sidebar";
import { APIKey } from "components/icons/APIKey";
import { Tags } from "components/icons/Tags";
import { User } from "components/icons/User";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { ActivitiesTypes } from "../icons/ActivitiesTypes";
import { Integration } from "../icons/Integration";

export const SidebarSettings = () => {
  const { slug } = useUser();
  const pathname = usePathname();

  const routes = [
    {
      icon: <User className="size-[16px]" />,
      label: "Profile",
      href: `/${slug}/settings`,
      isActive: pathname === `/${slug}/settings`,
    },
    {
      icon: <Tags className="size-[16px]" />,
      label: "Tags",
      href: `/${slug}/settings/tags`,
      isActive: pathname.startsWith(`/${slug}/settings/tags`),
    },
    {
      icon: <ActivitiesTypes className="size-[16px]" />,
      label: "Activity types",
      href: `/${slug}/settings/activity-types`,
      isActive: pathname.startsWith(`/${slug}/settings/activity-types`),
    },
    {
      icon: <Integration className="size-[18px]" />,
      label: "Integrations",
      href: `/${slug}/settings/integrations`,
      isActive: pathname.startsWith(`/${slug}/settings/integrations`),
    },
    {
      icon: <APIKey className="size-[18px]" />,
      label: "API",
      href: `/${slug}/settings/api`,
      isActive: pathname.startsWith(`/${slug}/settings/api`),
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={`/${slug}`}>
                <ArrowLeft />
                Back to dashboard
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
    </Sidebar>
  );
};
