"use client";

import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Activity, BarChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Tabs = () => {
  const pathname = usePathname();
  const currentPath = pathname.split("/").slice(0, 4).join("/");
  const activeTab = pathname.split("/").pop();

  const tabs = [
    {
      icon: <BarChart size={14} />,
      label: "Analytics",
      href: `${currentPath}/analytics`,
      isActive: activeTab === "analytics",
    },
    {
      icon: <Activity size={14} />,
      label: "Activities",
      href: `${currentPath}/activities`,
      isActive: activeTab === "activities",
    },
  ];
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          replace={true}
          className={cn(
            buttonVariants({ variant: "outline", size: "xs" }),
            "gap-2",
            !tab.isActive && "text-muted-foreground",
          )}
        >
          {tab.icon}
          {tab.label}
        </Link>
      ))}
    </div>
  );
};
