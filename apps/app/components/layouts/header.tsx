"use client";

import { useWorkspace } from "@/hooks/useWorkspace";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@conquest/ui/breadcrumb";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { SidebarTrigger, useSidebar } from "@conquest/ui/sidebar";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  title: string;
  currentPage?: string;
};

export const Header = ({ title, currentPage, children, className }: Props) => {
  const { open } = useSidebar();
  const { slug } = useWorkspace();

  return (
    <div
      className={cn(
        "flex min-h-12 shrink-0 items-center justify-between px-3",
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
        {currentPage ? (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${slug}/${title.toLowerCase()}`}>
                  {title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <p className="font-medium">{title}</p>
        )}
      </div>
      {children}
    </div>
  );
};
