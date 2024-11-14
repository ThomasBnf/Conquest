"use client";

import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { SidebarTrigger, useSidebar } from "@conquest/ui/sidebar";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  title: string;
};

export const Header = ({ title, children, className }: Props) => {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-12 shrink-0 items-center justify-between px-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {!open && (
          <>
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-1 h-4" />
          </>
        )}
        <h2 className="font-medium">{title}</h2>
      </div>
      {children}
    </div>
  );
};
