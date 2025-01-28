"use client";

import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Activity, BarChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TabItem = {
  icon: JSX.Element;
  label: string;
  href: string;
  isActive: boolean;
};

export const Tabs = () => {
  const pathname = usePathname();
  const currentPath = pathname.split("/").slice(0, 4).join("/");
  const activeTab = pathname.split("/").pop();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({});
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const tabs: TabItem[] = [
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

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.isActive);
    if (activeIndex !== -1) {
      const activeElement = tabRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="relative flex h-12 items-center gap-2 px-4">
      <div
        className="absolute h-8 rounded bg-muted transition-all duration-300 ease-out"
        style={{
          ...hoverStyle,
          opacity: hoveredIndex !== null ? 1 : 0,
        }}
      />
      <div
        className="absolute bottom-0 h-0.5 rounded-full bg-primary/80 transition-all duration-300 ease-out"
        style={activeStyle}
      />
      {tabs.map((tab, index) => (
        <Link
          key={tab.href}
          ref={(el) => {
            if (el) {
              tabRefs.current[index] = el;
            }
          }}
          href={tab.href}
          replace
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={cn(
            buttonVariants({ variant: "transparent", size: "xs" }),
            "relative gap-2",
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
