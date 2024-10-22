"use client";

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
import { useUser } from "context/userContext";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { Integration } from "../icons/Integration";

export const SidebarSettings = () => {
  const { slug } = useUser();
  const pathname = usePathname();

  const routes = [
    {
      icon: <User className="size-[16px]" />,
      label: "Profile",
      href: `/w/${slug}/settings`,
      isActive: pathname === `/w/${slug}/settings`,
    },
    {
      icon: <Tags className="size-[16px]" />,
      label: "Tags",
      href: `/w/${slug}/settings/tags`,
      isActive: pathname.startsWith(`/w/${slug}/settings/tags`),
    },
    {
      icon: <Integration className="size-[18px]" />,
      label: "Integrations",
      href: `/w/${slug}/settings/integrations`,
      isActive: pathname.startsWith(`/w/${slug}/settings/integrations`),
    },
    {
      icon: <APIKey className="size-[18px]" />,
      label: "API",
      href: `/w/${slug}/settings/api`,
      isActive: pathname.startsWith(`/w/${slug}/settings/api`),
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={`/w/${slug}`}>
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
