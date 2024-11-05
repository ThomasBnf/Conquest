"use client";

import { useUser } from "@/context/userContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@conquest/ui/breadcrumb";
import { Separator } from "@conquest/ui/separator";
import { SidebarTrigger, useSidebar } from "@conquest/ui/sidebar";
import Link from "next/link";
import type { PropsWithChildren } from "react";

type Props = {
  title: string;
  currentPage: string;
};

export const HeaderSubPage = ({
  title,
  currentPage,
  children,
}: PropsWithChildren<Props>) => {
  const { slug } = useUser();
  const { open } = useSidebar();

  return (
    <div className="flex min-h-12 shrink-0 items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {!open && (
          <>
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-1 h-4" />
          </>
        )}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${slug}/${title.toLowerCase()}`}>{title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {children}
    </div>
  );
};
