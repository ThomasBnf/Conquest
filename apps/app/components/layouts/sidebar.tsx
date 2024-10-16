"use client";

import { Activities } from "components/icons/Activities";
import { Contacts } from "components/icons/Contacts";
import { Dashboard } from "components/icons/Dashboard";
import { LeaderBoard } from "components/icons/Leaderbord";
import { Settings } from "components/icons/Settings";
import { Workflows } from "components/icons/Workflows";
import { useUser } from "context/userContext";
import { WorkspaceMenu } from "features/user/workspace-menu";
import { usePathname } from "next/navigation";
import { Logout } from "./log-out";
import { Route } from "./route";
import { SidebarSettings } from "./sidebar-settings";

export const Sidebar = () => {
  const { slug } = useUser();
  const pathname = usePathname();

  if (pathname.startsWith(`/w/${slug}/settings`)) return <SidebarSettings />;

  const routes = [
    {
      label: "Dashboard",
      icon: <Dashboard className="size-[18px]" />,
      href: `/w/${slug}`,
      isActive: pathname === `/w/${slug}`,
    },
    {
      label: "Contacts",
      icon: <Contacts className="size-[18px]" />,
      href: `/w/${slug}/contacts`,
      isActive: pathname.startsWith(`/w/${slug}/contacts`),
    },
    {
      label: "Leaderboard",
      icon: <LeaderBoard className="size-[18px]" />,
      href: `/w/${slug}/leaderboard`,
      isActive: pathname.startsWith(`/w/${slug}/leaderboard`),
    },
    {
      label: "Activities",
      icon: <Activities className="size-[18px]" />,
      href: `/w/${slug}/activities`,
      isActive: pathname.startsWith(`/w/${slug}/activities`),
    },
    {
      label: "Workflows",
      icon: <Workflows className="size-[18px]" />,
      href: `/w/${slug}/workflows`,
      isActive: pathname.startsWith(`/w/${slug}/workflows`),
    },
  ];

  return (
    <div className="flex h-full max-w-48 w-full flex-col bg-secondary">
      <WorkspaceMenu />
      <div className="flex flex-col gap-0.5 p-2">
        {routes.map((route) => (
          <Route key={route.label} {...route} />
        ))}
      </div>
      <div className="mt-auto space-y-0.5 p-2">
        <Route
          {...{
            label: "Settings",
            icon: <Settings className="size-[18px]" />,
            href: `/w/${slug}/settings`,
            isActive: pathname.startsWith(`/w/${slug}/settings`),
          }}
        />
        <Logout />
      </div>
    </div>
  );
};
